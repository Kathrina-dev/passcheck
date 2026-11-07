# PassCheck

PassCheck checks a submitted password against the wordlists in
`data/wordlists/`. The wordlists are bundled with the application and are not
served as public assets.

## Development

Install the dependencies and start Rails:

```sh
bin/setup
bin/rails server
```

Run the test suite with:

```sh
bin/rails test
```

## Deployment

The production Docker image includes the tracked wordlists. Puma already reads
the listening port from `PORT`, so container platforms can provide their
assigned port at runtime.

PassCheck does not persist password checks. If persistence is added later, use
an external database rather than relying on the local SQLite file in a
serverless or container deployment.

Before publishing a deployment, review [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
and confirm the redistribution terms for the exact wordlist files.