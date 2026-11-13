#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4dfc93fb8de0136932da859a99d9aa8e5492b71e2bf8b6c95511a281b7632e5d/contract';
import endContract from '../../snapshots/4dfc93fb8de0136932da859a99d9aa8e5492b71e2bf8b6c95511a281b7632e5d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7f57e84a24960be84321b0a33f8907c4327c627006ae2fa567ef49e56bb78789/contract';
import startContract from '../../snapshots/7f57e84a24960be84321b0a33f8907c4327c627006ae2fa567ef49e56bb78789/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('role', 'text', {
          notNull: true,
          default: lit('agent'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'user',
        constraint: 'user_role_check_b3266c03',
        expression: sql`"role" IN ('admin', 'agent')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
