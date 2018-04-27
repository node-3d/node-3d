# Contributing to Node3D


The following is a set of guidelines for contributing to **Node3D** and its modules,
which are hosted in the [Node3D Organization](https://github.com/node-3d) on GitHub.


#### Table Of Contents

[How Can I Contribute?](#how-can-i-contribute)
  * [Submitting A Bug Report](#submitting-a-bug-report)
  * [Submitting An Enhancement Suggestion](#submitting-an-enhancement-suggestion)
  * [Pull Requests](#pull-requests)

[Styleguides](#styleguides)
  * [Git Commit Messages](#git-commit-messages)
  * [Node3D Styleguide](#node3d-styleguide)


## How Can I Contribute?


### Submitting A Bug Report

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/).
After you've determined [which repository](#node3d-packages)
your bug is related to, create an issue on that repository.

Explain the problem and include additional details to help maintainers reproduce the problem:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
Include links to files or GitHub projects, or copy/pastable snippets,
which you use in those examples. If you're providing snippets in the issue,
use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the behavior you observed after following the steps**
and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **If the problem wasn't triggered by a specific action**, describe what you
were doing before the problem happened.


### Submitting An Enhancement Suggestion

Enhancement suggestions are tracked as
[GitHub issues](https://guides.github.com/features/issues/).
After you've determined [which repository](#node3d-packages)
your enhancement suggestion is related to, create an issue on that
repository and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement**
in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
Include copy/pastable snippets which you use in those examples,
as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the current behavior** and
**explain which behavior you expected to see instead** and why.
* **Explain why this enhancement would be useful** to most Node3D
users and isn't something that can or should be implemented as a [community package](#node3d-packages).


### Pull Requests

* Do not include issue numbers in the PR title
* Follow the [Node3D Styleguide](#node3d-styleguide).


## Node3D Styleguide


The code must adhere to [Node3D Codestyle](/CODESTYLE.md).


## File System

1. Only lowercase in file/directory names.

1. Words are separated with dashes.

1. Do not publish unnecessary files to NPM, use **.npmignore** file.

1. If there is an empty directory to be kept, place an empty **.keep** file inside.

1. Use [SemVer](https://semver.org) versioning pattern.


### Git Commit Messages

1. Use the present tense ("Add feature" not "Added feature").

1. Use the imperative mood ("Move cursor to..." not "Moves cursor to...").

1. Limit the first line to 72 characters or less.

1. Reference issues and pull requests liberally after the first line.

1. Consider starting the commit message with an applicable emoji:
	* :art: `:art:` when improving the format/structure of the code;
	* :racehorse: `:racehorse:` when improving performance;
	* :non-potable_water: `:non-potable_water:` when plugging memory leaks;
	* :memo: `:memo:` when writing docs;
	* :penguin: `:penguin:` when fixing something on Linux;
	* :apple: `:apple:` when fixing something on macOS;
	* :checkered_flag: `:checkered_flag:` when fixing something on Windows;
	* :bug: `:bug:` when fixing a bug;
	* :fire: `:fire:` when removing code or files;
	* :green_heart: `:green_heart:` when fixing the CI build;
	* :white_check_mark: `:white_check_mark:` when adding tests;
	* :lock: `:lock:` when dealing with security;
	* :arrow_up: `:arrow_up:` when upgrading dependencies;
	* :arrow_down: `:arrow_down:` when downgrading dependencies;
	* :shirt: `:shirt:` when removing linter warnings;
