# Architecture

A Modula module exists in three states:

1. Source repo
2. Release artifact
3. Installed runtime copy

The source repo is the editable truth.
The release artifact is the packaged output.
The installed runtime copy is the deployed version inside Modula.

The runtime copy must never become the main authoring source.
