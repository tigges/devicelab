/// <reference path="../.astro/types.d.ts" />

type KVNamespace = import('@cloudflare/workers-types').KVNamespace;

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        TRACK_PRICE_KV?: KVNamespace;
      };
    };
  }
}
