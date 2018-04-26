# Contributing to Node3D


The following is a set of guidelines for contributing to Node3D and its packages,
which are hosted in the [Node3D Organization](https://github.com/node-node3d) on GitHub.


#### Table Of Contents

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Suggesting Enhancements](#suggesting-enhancements)
  * [Pull Requests](#pull-requests)

[Styleguides](#styleguides)
  * [Git Commit Messages](#git-commit-messages)
  * [Node3D Styleguide](#node3d-styleguide)


## Node3D Packages

Node3D is a large open source project &mdash; it's made up of over
[20 repositories](https://github.com/node-node3d). Node3D is intentionally very modular.

All modules are divided into 3 categories: deps, addons, aggregators:

* Packages that carry one or more binary libraries are published as `deps-[package-name]`.
* Addon packages are Node.js addons, which provide certain native functions, and
require compilation with **node-gyp** upon installation. They have arbitrary names.
* Pure script packages aggregate functionality from several submodules
and provide high-level abstractions. The naming is `3d-[package-name]`.


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


#### Submitting An Enhancement Suggestion

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


## Styleguides


### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * :art: `:art:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :penguin: `:penguin:` when fixing something on Linux
    * :apple: `:apple:` when fixing something on macOS
    * :checkered_flag: `:checkered_flag:` when fixing something on Windows
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies
    * :shirt: `:shirt:` when removing linter warnings


### Node3D Styleguide

All JavaScript must adhere to [JavaScript Standard Style](https://standardjs.com/).
