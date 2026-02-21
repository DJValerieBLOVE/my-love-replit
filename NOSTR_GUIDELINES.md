# THE NOSTR MASTER REFERENCE GUIDE (For AI Agents)

**CRITICAL DIRECTIVE FOR AI:** Do not invent custom protocol code, WebSocket handling, or cryptographic functions. You MUST check the repositories, NPM libraries, and NIP specifications below before writing any Nostr-related implementation.

## 1. Reference Repositories (Read these first for implementation examples)

- **Primal Web App** (https://github.com/PrimalHQ/primal-web-app): The primary reference for UI, caching, and user experience. Check how Primal handles feeds, zaps, and media.
- **Nostr Development Kit (NDK)** (https://github.com/nostr-dev-kit/ndk): The absolute standard for building modern Nostr applications in JS/TS/Svelte/React.
- **NIPs Official Repo** (https://github.com/nostr-protocol/nips): The source of truth for all Nostr Implementation Possibilities.

## 2. Core NPM Libraries (Do not reinvent these)

- **@nostr-dev-kit/ndk**: Use this as the foundational framework. It handles relay connections, subscriptions, signing, and caching.
- **nostr-tools**: Use this for low-level cryptographic operations (generating keys, signing events, decoding bech32 like npub and note).
- **@nostr-dev-kit/ndk-blossom**: Mandatory for Media. Use this extension for NDK to support the Blossom protocol (handling image/video uploads, mirroring, and fallback URLs).
- **nostr-fetch**: Use this utility if you need to effortlessly and reliably fetch historical past events from multiple relays without dealing with raw WebSocket limits.

## 3. Media & File Uploads (Blossom Protocol)

Do not write custom HTTP endpoints for media. Nostr has moved to the Blossom Protocol (BUDs) for media servers.

- **BUD-01 & BUD-02**: Server requirements and Blob upload/management.
- **BUD-03**: Fetching user server lists (Kind 10063).
- **Implementation**: Rely entirely on the `@nostr-dev-kit/ndk-blossom` library for uploading. It automatically handles calculating SHA-256 hashes, selecting the right Blossom servers, and injecting the correct metadata tags.
- **Primary server**: `blossom.primal.net` (Primal's Blossom server, free for all Nostr users)
- **Fallback server**: `blossom.nostr.build`

## 4. Essential NIPs (Protocol Specifications)

When structuring events, refer to these rules strictly:

- **NIP-01**: Basic Protocol Flow (The foundation: events, kinds, tags, signatures).
- **NIP-05**: DNS-based Verification (Handling user@domain.com identities).
- **NIP-19**: Bech32 Encoding (Handling npub, nsec, note, nevent, and nprofile). Never put a raw hex key in a user-facing UI.
- **NIP-57**: Zaps (Lightning Network tips). Handle Kind 9734 (Zap Request) and Kind 9735 (Zap Receipt).
- **NIP-94**: File Metadata. Use this for standardizing how files are linked in notes.
- **NIP-07**: Browser Extensions (Handling window.nostr for secure login via extensions like Alby or nos2x).
- **NIP-10**: Reply Threading (e, p tags for threaded conversations).
- **NIP-25**: Reactions (Kind 7 events for likes).
- **NIP-44**: Encrypted Payloads (For private data encryption).
- **NIP-46**: Nostr Connect / Bunker Login (Remote signing via nsec.app).
- **NIP-65**: Relay List Metadata (Kind 10002 for user relay preferences).

## 5. Implementation Checklist

Before writing ANY Nostr code, answer these questions:

1. **Which NIP covers this?** Look it up in the NIPs repo.
2. **How does Primal implement it?** Check their web app source code.
3. **Does an NDK package exist for it?** Check npm for @nostr-dev-kit packages.
4. **Am I reinventing something?** If yes, STOP and use the existing library.
5. **Did I read the existing codebase?** Check what's already built before adding new code.
