// oxlint-disable no-console
import { readFile } from 'node:fs/promises';
import path from 'node:path';

type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

type PackageJson = {
  name?: unknown;
  version?: unknown;
  workspaces?: unknown;
} & Partial<Record<DependencySection, unknown>>;

type WorkspacePackage = {
  dir: string;
  name: string;
  version: string;
  packageJson: PackageJson;
};

type Version = readonly [number, number, number];

const root = process.cwd();

const dependencySections: readonly DependencySection[] = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

const readJson = async <T>(filePath: string): Promise<T> => (
  JSON.parse(await readFile(filePath, 'utf8')) as T
);

const readString = (value: unknown, fallback: string): string => (
  typeof value === 'string' ? value : fallback
);

const readStringArray = (value: unknown): readonly string[] => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
);

const readDependencyMap = (value: unknown): Readonly<Record<string, string>> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
};

const parseVersion = (value: string): Version | null => {
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)/u);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const compareVersion = (a: Version, b: Version): number => {
  for (let index = 0; index < 3; index += 1) {
    const delta = a[index] - b[index];

    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
};

const satisfiesSimpleRange = (version: string, range: string): boolean | null => {
  if (range === '*' || range === version) {
    return true;
  }

  const parsedVersion = parseVersion(version);
  const [prefix] = range;

  if (!parsedVersion || (prefix !== '^' && prefix !== '~')) {
    return null;
  }

  const parsedRange = parseVersion(range.slice(1));

  if (!parsedRange || compareVersion(parsedVersion, parsedRange) < 0) {
    return false;
  }

  if (prefix === '~') {
    return parsedVersion[0] === parsedRange[0] && parsedVersion[1] === parsedRange[1];
  }

  const [major, minor, patch] = parsedRange;

  if (major > 0) {
    return parsedVersion[0] === major;
  }

  if (minor > 0) {
    return parsedVersion[0] === major && parsedVersion[1] === minor;
  }

  return parsedVersion[0] === major && parsedVersion[1] === minor && parsedVersion[2] === patch;
};

const rootPackage = await readJson<PackageJson>(path.join(root, 'package.json'));
const packages: WorkspacePackage[] = [];

for (const workspace of readStringArray(rootPackage.workspaces)) {
  // oxlint-disable-next-line no-await-in-loop
  const packageJson = await readJson<PackageJson>(path.join(root, workspace, 'package.json'));

  packages.push({
    dir: workspace,
    name: readString(packageJson.name, workspace),
    version: readString(packageJson.version, '0.0.0'),
    packageJson,
  });
}

const localNames = new Set(packages.map((pkg) => pkg.name));
const localVersions = new Map(packages.map((pkg) => [pkg.name, pkg.version]));

for (const pkg of packages) {
  console.log(`${pkg.name}@${pkg.version} (${pkg.dir})`);

  let printedDependency = false;

  for (const section of dependencySections) {
    const dependencies = readDependencyMap(pkg.packageJson[section]);
    const localDependencies = Object.entries(dependencies)
      .filter(([name]) => localNames.has(name))
      .toSorted(([a], [b]) => a.localeCompare(b));

    for (const [name, spec] of localDependencies) {
      printedDependency = true;
      const localVersion = localVersions.get(name);
      const satisfies = localVersion ? satisfiesSimpleRange(localVersion, spec) : null;
      const warning = satisfies === false
        ? ` [local ${localVersion} does not satisfy ${spec}]`
        : '';
      console.log(`  ${section}: ${name}@${spec}${warning}`);
    }
  }

  if (!printedDependency) {
    console.log('  no local workspace dependencies');
  }

  console.log();
}
