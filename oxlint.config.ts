import { defineConfig } from 'oxlint';
import type { OxlintConfig } from 'oxlint';
import sharedConfig from '@node-3d/addon-tools/oxlint';

const config: OxlintConfig = {
	...sharedConfig,
	ignorePatterns: [
		...(sharedConfig.ignorePatterns ?? []),
		'packages/core/examples/palette/utils/DRACOLoader.ts',
		'packages/@node-3d/plugin-qml/examples/qt-calqlatr/calqlatr/content/calculator.js',
		'packages/@node-3d/qml-themedui/ThemedUi/default-theme.js',
		'packages/@node-3d/qml-themedui/examples/qml/themes/themes.js',
		'packages/@node-3d/webaudio/examples/pending/*.js',
	],
	options: {
		denyWarnings: true,
		reportUnusedDisableDirectives: 'error',
	},
};

export default defineConfig(config);
