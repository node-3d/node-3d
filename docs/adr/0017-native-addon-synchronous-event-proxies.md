# 0017 - Native Addon Synchronous Event Proxies

## Status

Accepted.

## Context

Some native APIs invoke application-defined interfaces and require a result before
the native call can continue. A queued event is insufficient for these callbacks:
the caller needs a synchronous decision, such as accepting an incoming connection
or selecting a native handler object.

Node3D addons need a consistent way to expose those synchronous callbacks without
treating a JavaScript object reference as thread-safe.

## Decision

When a native callback is guaranteed to execute on the Node.js thread, an addon
may retain a persistent JavaScript proxy object (`Napi::ObjectReference`). The
binding invokes explicitly named methods on that object to obtain the required
synchronous native result. The proxy may expose several specialized methods;
addons should not use a catch-all event method when the native operations have
different inputs or result contracts.

The proxy reference provides object lifetime and an associated `Napi::Env`. It
does not make Node-API calls legal from another thread. Native callbacks that may
run on arbitrary threads must copy only native data into synchronized state and
return an immediate native-safe answer. JavaScript observes that work later on
the Node.js thread through the addon’s existing polling/event mechanism, or a
separate explicitly designed cross-thread delivery mechanism.

Addons must release or disable persistent proxies before environment teardown and
before native state they depend on is destroyed. A proxy is not a substitute for
documenting native ownership, thread affinity, or synchronous result semantics.

## Consequences

Synchronous callbacks can remain direct where their native call path is already
on Node’s thread, while callbacks from worker threads never enter Node-API
unsafely.

APIs whose worker-thread callbacks require a synchronous answer must define a
native-safe default or queue-acceptance policy; they cannot wait for JavaScript
polling.
