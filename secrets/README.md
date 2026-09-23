# secrets/

Local credentials for the backend services. Everything in this directory
except this README and `local.env.example` is gitignored.

| File | Used by | What |
|---|---|---|
| `local.env` | api_gateway, order_service | `FIREBASE_PROJECT_ID` (gateway), `STRIPE_SECRET` and `STRIPE_PUBLIC` (order) |
| `firebase-service-account.json` | api_gateway, user_service | Firebase Admin SDK key (Project settings > Service accounts > Generate new private key) |

Setup:

```
cp secrets/local.env.example secrets/local.env    # then fill it in
mv ~/Downloads/<project>-firebase-adminsdk-*.json secrets/firebase-service-account.json
chmod 600 secrets/*
```

How the services find them:

- The gateway and order_service import `local.env` as a properties file via
  `spring.config.import` (`optional:`, so a missing file isn't fatal on its
  own). Real environment variables with the same names override it.
- The service account is read from `FIREBASE_SERVICE_ACCOUNT`, a Spring
  resource location, which defaults to
  `file:${SECRETS_DIR}/firebase-service-account.json`.
- `SECRETS_DIR` defaults to `../secrets`, relative to the working directory.
  `scripts/dev.sh` and the IntelliJ run configurations both run each service
  from its module directory, so that resolves here. Set `SECRETS_DIR` (or the
  individual variables) when running from anywhere else.

The frontend's keys are separate: `web_app/.env` (also gitignored).
