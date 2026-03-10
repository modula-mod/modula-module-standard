# Modula Module Standard

Canonical standard, contract, and scaffold for Modula modules.

## Purpose

This repository defines the official structure and metadata contract for all Modula modules.

Every module should exist in three forms:

1. Source module repo
2. Published release artifact
3. Installed runtime copy inside Modula

## Required root files

- manifest.json
- module.json
- README.md
- CHANGELOG.md
- icon.svg

## Required directories

- backend/
- frontend/
- widgets/
- migrations/
- tests/

## Strongly recommended

- docs/
- scripts/
- shared/
- dist/
- package.json
- LICENSE
- cover.png
- .env.example

## Module classes

- surface
- widget
- service
- hybrid

## Source of truth rule

Edit in the source repo, build a release artifact, then install or sync into Modula runtime.

Do not treat the installed runtime copy as the editing source of truth.
