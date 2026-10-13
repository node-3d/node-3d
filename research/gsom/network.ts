/** One guest over direct UDP. The host alone runs game rules and assigns player 2. */
import { init, pollEvents, runCallbacks, shutdown, sockets } from '@node-3d/gabenet';
import type { Game, GameState, JournalEntry } from './model.ts';
import {
	parseGuestInput,
	parseInputPacket,
	parseSnapshotPacket,
	receiveEvents,
	type GuestInput,
	type InputPacket,
	type StatePacket,
} from './protocol.ts';

type Connection = ReturnType<typeof sockets.connectByIPAddress>;
export type { GuestInput } from './protocol.ts';
export type NetworkMetrics = {
	connected: boolean;
	joins: number;
	leaves: number;
	inputsSent: number;
	inputsReceived: number;
	rejectedPackets: number;
	snapshotsSent: number;
	snapshotsReceived: number;
	lastSnapshotTick: number;
	missedEvents: number;
};

export class CoopNetwork {
	readonly role: 'host' | 'guest';
	readonly metrics: NetworkMetrics = {
		connected: false,
		joins: 0,
		leaves: 0,
		inputsSent: 0,
		inputsReceived: 0,
		rejectedPackets: 0,
		snapshotsSent: 0,
		snapshotsReceived: 0,
		lastSnapshotTick: -1,
		missedEvents: 0,
	};
	readonly events: JournalEntry[] = [];
	state: GameState | null = null;
	private readonly listenSocket: ReturnType<typeof sockets.createListenSocketIP> | null;
	private connection: Connection | null = null;
	private lastSequence = -1;
	private lastPublished = -Infinity;

	constructor(
		options:
			| { role: 'host'; port: number; bind?: string }
			| { role: 'guest'; port: number; host: string },
	) {
		const result = init();
		if (!result.ok) throw new Error(result.errorMessage);
		this.role = options.role;
		if (options.role === 'host') {
			this.listenSocket = sockets.createListenSocketIP(
				options.port,
				options.bind ?? '0.0.0.0',
			);
		} else {
			this.listenSocket = null;
			this.connection = sockets.connectByIPAddress(options.host, options.port);
		}
	}

	poll(game?: Game): void {
		runCallbacks();
		for (const event of pollEvents()) {
			if (event.type !== 'connection-status-changed') continue;
			if (
				this.role === 'host' &&
				event.listenSocket === this.listenSocket &&
				event.state < 4
			) {
				if (this.connection && this.connection !== event.connection) {
					sockets.closeConnection(event.connection);
					continue;
				}
				this.connection = event.connection;
				if (event.state !== 3) sockets.acceptConnection(event.connection);
			}
			if (event.connection !== this.connection) continue;
			if (event.state === 3 && !this.metrics.connected) {
				this.metrics.connected = true;
				this.metrics.joins++;
				if (this.role === 'host') game?.dispatch({ type: 'join' });
			}
			if (event.state >= 4) {
				if (this.metrics.connected) {
					this.metrics.leaves++;
					if (this.role === 'host') game?.dispatch({ type: 'leave' });
				}
				this.metrics.connected = false;
				this.connection = null;
			}
		}
		if (!this.metrics.connected || !this.connection) return;
		for (const message of sockets.receiveMessagesOnConnection(this.connection)) {
			if (message.data.length > 64_000) {
				this.metrics.rejectedPackets++;
				continue;
			}
			let packet: unknown;
			try {
				packet = JSON.parse(message.data.toString()) as unknown;
			} catch {
				this.metrics.rejectedPackets++;
				continue;
			}
			if (this.role === 'host') {
				const input = parseInputPacket(packet);
				if (!input || !game) {
					this.metrics.rejectedPackets++;
					continue;
				}
				game.dispatch({ ...input.command, playerId: 2 });
				this.metrics.inputsReceived++;
			} else {
				const snapshot = parseSnapshotPacket(packet);
				if (!snapshot) {
					this.metrics.rejectedPackets++;
					continue;
				}
				if (snapshot.state.tick < this.metrics.lastSnapshotTick) continue;
				this.state = snapshot.state;
				this.metrics.lastSnapshotTick = snapshot.state.tick;
				this.metrics.snapshotsReceived++;
				const received = receiveEvents(snapshot.events, this.lastSequence);
				this.events.push(...received.accepted);
				this.lastSequence = received.lastSequence;
				this.metrics.missedEvents += received.gaps;
			}
		}
	}

	sendInput(command: GuestInput): boolean {
		if (this.role !== 'guest' || !this.metrics.connected || !this.connection) return false;
		const clean = parseGuestInput(command);
		if (!clean) return false;
		const packet: InputPacket = { version: 1, type: 'input', command: clean };
		const result = sockets.sendMessageToConnection(
			this.connection,
			Buffer.from(JSON.stringify(packet)),
		);
		if (result.result < 0) return false;
		this.metrics.inputsSent++;
		return true;
	}

	publish(game: Game, now = performance.now()): void {
		if (
			this.role !== 'host' ||
			!this.metrics.connected ||
			!this.connection ||
			now - this.lastPublished < 50
		)
			return;
		const packet: StatePacket = {
			version: 1,
			type: 'snapshot',
			state: game.snapshot(),
			events: game.journal.slice(-64),
		};
		const result = sockets.sendMessageToConnection(
			this.connection,
			Buffer.from(JSON.stringify(packet)),
		);
		if (result.result < 0) return;
		this.metrics.snapshotsSent++;
		this.lastPublished = now;
	}

	close(): void {
		if (this.connection) sockets.closeConnection(this.connection);
		if (this.listenSocket) sockets.closeListenSocket(this.listenSocket);
		shutdown();
	}
}
