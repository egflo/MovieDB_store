-- Runs once, on first startup of an empty postgres volume.
-- inventory_service and order_service each expect their own database;
-- the official image's POSTGRES_DB only creates one.
CREATE DATABASE inventorydb;
CREATE DATABASE orderdb;

-- Mongo needs no setup: moviedb and userdb are created on first write.
