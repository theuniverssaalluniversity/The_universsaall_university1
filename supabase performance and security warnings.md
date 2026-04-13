QUERY PERFORMANCE WARNINGS
SLOW QUERIES :
    {"[
  {
    "query": "SELECT wal->>$5 as type,\n       wal->>$6 as schema,\n       wal->>$7 as table,\n       COALESCE(wal->>$8, $9) as columns,\n       COALESCE(wal->>$10, $11) as record,\n       COALESCE(wal->>$12, $13) as old_record,\n       wal->>$14 as commit_timestamp,\n       subscription_ids,\n       errors\nFROM realtime.list_changes($1, $2, $3, $4)",
    "rolname": "supabase_admin",
    "calls": 18343,
    "mean_time": 3.55903003652621,
    "min_time": 3.180609,
    "max_time": 143.975593,
    "total_time": 65283.28796,
    "rows_read": 0,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 47.87652231403756,
    "index_advisor_result": null
  },
  {
    "query": "with f as (\n      \n-- CTE with sane arg_modes, arg_names, and arg_types.\n-- All three are always of the same length.\n-- All three include all args, including OUT and TABLE args.\nwith functions as (\n  select\n    *,\n    -- proargmodes is null when all arg modes are IN\n    coalesce(\n      p.proargmodes,\n      array_fill($1::text, array[cardinality(coalesce(p.proallargtypes, p.proargtypes))])\n    ) as arg_modes,\n    -- proargnames is null when all args are unnamed\n    coalesce(\n      p.proargnames,\n      array_fill($2::text, array[cardinality(coalesce(p.proallargtypes, p.proargtypes))])\n    ) as arg_names,\n    -- proallargtypes is null when all arg modes are IN\n    coalesce(p.proallargtypes, p.proargtypes) as arg_types,\n    array_cat(\n      array_fill($3, array[pronargs - pronargdefaults]),\n      array_fill($4, array[pronargdefaults])) as arg_has_defaults\n  from\n    pg_proc as p\n  where\n    p.prokind = $5\n)\nselect\n  f.oid as id,\n  n.nspname as schema,\n  f.proname as name,\n  l.lanname as language,\n  case\n    when l.lanname = $6 then $7\n    else f.prosrc\n  end as definition,\n  case\n    when l.lanname = $8 then f.prosrc\n    else pg_get_functiondef(f.oid)\n  end as complete_statement,\n  coalesce(f_args.args, $9) as args,\n  pg_get_function_arguments(f.oid) as argument_types,\n  pg_get_function_identity_arguments(f.oid) as identity_argument_types,\n  f.prorettype as return_type_id,\n  pg_get_function_result(f.oid) as return_type,\n  nullif(rt.typrelid, $10) as return_type_relation_id,\n  f.proretset as is_set_returning_function,\n  case\n    when f.provolatile = $11 then $12\n    when f.provolatile = $13 then $14\n    when f.provolatile = $15 then $16\n  end as behavior,\n  f.prosecdef as security_definer,\n  f_config.config_params as config_params\nfrom\n  functions f\n  left join pg_namespace n on f.pronamespace = n.oid\n  left join pg_language l on f.prolang = l.oid\n  left join pg_type rt on rt.oid = f.prorettype\n  left join (\n    select\n      oid,\n      jsonb_object_agg(param, value) filter (where param is not null) as config_params\n    from\n      (\n        select\n          oid,\n          (string_to_array(unnest(proconfig), $17))[$18] as param,\n          (string_to_array(unnest(proconfig), $19))[$20] as value\n        from\n          functions\n      ) as t\n    group by\n      oid\n  ) f_config on f_config.oid = f.oid\n  left join (\n    select\n      oid,\n      jsonb_agg(jsonb_build_object(\n        $21, t2.mode,\n        $22, name,\n        $23, type_id,\n        -- Cast null into false boolean\n        $24, COALESCE(has_default, $25)\n      )) as args\n    from\n      (\n        select\n          oid,\n          unnest(arg_modes) as mode,\n          unnest(arg_names) as name,\n          -- Coming from: coalesce(p.proallargtypes, p.proargtypes) postgres won't automatically assume\n          -- integer, we need to cast it to be properly parsed\n          unnest(arg_types)::int8 as type_id,\n          unnest(arg_has_defaults) as has_default\n        from\n          functions\n      ) as t1,\n      lateral (\n        select\n          case\n            when t1.mode = $26 then $27\n            when t1.mode = $28 then $29\n            when t1.mode = $30 then $31\n            when t1.mode = $32 then $33\n            else $34\n          end as mode\n      ) as t2\n    group by\n      t1.oid\n  ) f_args on f_args.oid = f.oid\n\n    )\n    select\n      f.*\n    from f\n   where schema NOT IN ($35,$36,$37)\n\n-- source: dashboard\n-- user: b2717e53-20c6-4785-9935-ba071e063a5f\n-- date: 2026-01-22T09:50:24.575Z",
    "rolname": "postgres",
    "calls": 57,
    "mean_time": 511.630968614035,
    "min_time": 261.956236,
    "max_time": 907.139452,
    "total_time": 29162.965211,
    "rows_read": 6832,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 21.38711756557708,
    "index_advisor_result": null
  },
  {
    "query": "SELECT name FROM pg_timezone_names",
    "rolname": "authenticator",
    "calls": 33,
    "mean_time": 645.821955757576,
    "min_time": 52.793549,
    "max_time": 1912.886496,
    "total_time": 21312.12454,
    "rows_read": 39402,
    "cache_hit_rate": "0",
    "prop_total_time": 15.629580524866347,
    "index_advisor_result": null
  },
  {
    "query": "SELECT\n  e.name,\n  n.nspname AS schema,\n  e.default_version,\n  x.extversion AS installed_version,\n  e.comment\nFROM\n  pg_available_extensions() e(name, default_version, comment)\n  LEFT JOIN pg_extension x ON e.name = x.extname\n  LEFT JOIN pg_namespace n ON x.extnamespace = n.oid\nWHERE\n  $1",
    "rolname": "postgres",
    "calls": 82,
    "mean_time": 62.361306902439,
    "min_time": 2.230036,
    "max_time": 326.690662,
    "total_time": 5113.627166,
    "rows_read": 6396,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 3.75015862051363,
    "index_advisor_result": null
  },
  {
    "query": "with table_privileges as (\n-- Despite the name `table_privileges`, this includes other kinds of relations:\n-- views, matviews, etc. \"Relation privileges\" just doesn't roll off the tongue.\n--\n-- For each relation, get its relacl in a jsonb format,\n-- e.g.\n--\n-- '{postgres=arwdDxt/postgres}'\n--\n-- becomes\n--\n-- [\n--   {\n--     \"grantee\": \"postgres\",\n--     \"grantor\": \"postgres\",\n--     \"is_grantable\": false,\n--     \"privilege_type\": \"INSERT\"\n--   },\n--   ...\n-- ]\nselect\n  c.oid as relation_id,\n  nc.nspname as schema,\n  c.relname as name,\n  case\n    when c.relkind = $1 then $2\n    when c.relkind = $3 then $4\n    when c.relkind = $5 then $6\n    when c.relkind = $7 then $8\n    when c.relkind = $9 then $10\n  end as kind,\n  coalesce(\n    jsonb_agg(\n      jsonb_build_object(\n        $11, grantor.rolname,\n        $12, grantee.rolname,\n        $13, _priv.privilege_type,\n        $14, _priv.is_grantable\n      )\n    ) filter (where _priv is not null),\n    $15\n  ) as privileges\nfrom pg_class c\njoin pg_namespace as nc\n  on nc.oid = c.relnamespace\nleft join lateral (\n  select grantor, grantee, privilege_type, is_grantable\n  from aclexplode(coalesce(c.relacl, acldefault($16, c.relowner)))\n) as _priv on $17\nleft join pg_roles as grantor\n  on grantor.oid = _priv.grantor\nleft join (\n  select\n    pg_roles.oid,\n    pg_roles.rolname\n  from pg_roles\n  union all\n  select\n    ($18)::oid as oid, $19\n) as grantee (oid, rolname)\n  on grantee.oid = _priv.grantee\nwhere c.relkind in ($20, $21, $22, $23, $24)\n  and not pg_is_other_temp_schema(c.relnamespace)\n  and (\n    pg_has_role(c.relowner, $25)\n    or has_table_privilege(\n      c.oid,\n      $26\n      || case when current_setting($27)::int4 >= $28 then $29 else $30 end\n    )\n    or has_any_column_privilege(c.oid, $31)\n  )\ngroup by\n  c.oid,\n  nc.nspname,\n  c.relname,\n  c.relkind\n)\nselect *\nfrom table_privileges\n where schema NOT IN ($32,$33,$34)\n\n-- source: dashboard\n-- user: b2717e53-20c6-4785-9935-ba071e063a5f\n-- date: 2026-01-22T09:50:29.893Z",
    "rolname": "postgres",
    "calls": 16,
    "mean_time": 264.4912330625,
    "min_time": 215.106762,
    "max_time": 441.052315,
    "total_time": 4231.859729,
    "rows_read": 780,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 3.1035006519507027,
    "index_advisor_result": null
  },
  {
    "query": "-- postgres-migrations disable-transaction\nCREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_name_bucket_level_unique on storage.objects (name COLLATE \"C\", bucket_id, level)",
    "rolname": "supabase_storage_admin",
    "calls": 1,
    "mean_time": 2352.446016,
    "min_time": 2352.446016,
    "max_time": 2352.446016,
    "total_time": 2352.446016,
    "rows_read": 0,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 1.7252031522462667,
    "index_advisor_result": null
  },
  {
    "query": "WITH\n-- Recursively get the base types of domains\nbase_types AS (\n  WITH RECURSIVE\n  recurse AS (\n    SELECT\n      oid,\n      typbasetype,\n      typnamespace AS base_namespace,\n      COALESCE(NULLIF(typbasetype, $3), oid) AS base_type\n    FROM pg_type\n    UNION\n    SELECT\n      t.oid,\n      b.typbasetype,\n      b.typnamespace AS base_namespace,\n      COALESCE(NULLIF(b.typbasetype, $4), b.oid) AS base_type\n    FROM recurse t\n    JOIN pg_type b ON t.typbasetype = b.oid\n  )\n  SELECT\n    oid,\n    base_namespace,\n    base_type\n  FROM recurse\n  WHERE typbasetype = $5\n),\narguments AS (\n  SELECT\n    oid,\n    array_agg((\n      COALESCE(name, $6), -- name\n      type::regtype::text, -- type\n      CASE type\n        WHEN $7::regtype THEN $8\n        WHEN $9::regtype THEN $10\n        WHEN $11::regtype THEN $12\n        WHEN $13::regtype THEN $14\n        ELSE type::regtype::text\n      END, -- convert types that ignore the length and accept any value till maximum size\n      idx <= (pronargs - pronargdefaults), -- is_required\n      COALESCE(mode = $15, $16) -- is_variadic\n    ) ORDER BY idx) AS args,\n    CASE COUNT(*) - COUNT(name) -- number of unnamed arguments\n      WHEN $17 THEN $18\n      WHEN $19 THEN (array_agg(type))[$20] IN ($21::regtype, $22::regtype, $23::regtype, $24::regtype, $25::regtype)\n      ELSE $26\n    END AS callable\n  FROM pg_proc,\n       unnest(proargnames, proargtypes, proargmodes)\n         WITH ORDINALITY AS _ (name, type, mode, idx)\n  WHERE type IS NOT NULL -- only input arguments\n  GROUP BY oid\n)\nSELECT\n  pn.nspname AS proc_schema,\n  p.proname AS proc_name,\n  d.description AS proc_description,\n  COALESCE(a.args, $27) AS args,\n  tn.nspname AS schema,\n  COALESCE(comp.relname, t.typname) AS name,\n  p.proretset AS rettype_is_setof,\n  (t.typtype = $28\n   -- if any TABLE, INOUT or OUT arguments present, treat as composite\n   or COALESCE(proargmodes::text[] && $29, $30)\n  ) AS rettype_is_composite,\n  bt.oid <> bt.base_type as rettype_is_composite_alias,\n  p.provolatile,\n  p.provariadic > $31 as hasvariadic,\n  lower((regexp_split_to_array((regexp_split_to_array(iso_config, $32))[$33], $34))[$35]) AS transaction_isolation_level,\n  coalesce(func_settings.kvs, $36) as kvs\nFROM pg_proc p\nLEFT JOIN arguments a ON a.oid = p.oid\nJOIN pg_namespace pn ON pn.oid = p.pronamespace\nJOIN base_types bt ON bt.oid = p.prorettype\nJOIN pg_type t ON t.oid = bt.base_type\nJOIN pg_namespace tn ON tn.oid = t.typnamespace\nLEFT JOIN pg_class comp ON comp.oid = t.typrelid\nLEFT JOIN pg_description as d ON d.objoid = p.oid AND d.classoid = $37::regclass\nLEFT JOIN LATERAL unnest(proconfig) iso_config ON iso_config LIKE $38\nLEFT JOIN LATERAL (\n  SELECT\n    array_agg(row(\n      substr(setting, $39, strpos(setting, $40) - $41),\n      substr(setting, strpos(setting, $42) + $43)\n    )) as kvs\n  FROM unnest(proconfig) setting\n  WHERE setting ~ ANY($2)\n) func_settings ON $44\nWHERE t.oid <> $45::regtype AND COALESCE(a.callable, $46)\nAND prokind = $47\nAND p.pronamespace = ANY($1::regnamespace[])",
    "rolname": "authenticator",
    "calls": 33,
    "mean_time": 40.7347981818182,
    "min_time": 18.313767,
    "max_time": 100.112879,
    "total_time": 1344.24834,
    "rows_read": 156,
    "cache_hit_rate": "99.6365711539616748",
    "prop_total_time": 0.9858255865582471,
    "index_advisor_result": null
  },
  {
    "query": "with tables as (\nSELECT\n  c.oid :: int8 AS id,\n  nc.nspname AS schema,\n  c.relname AS name,\n  c.relrowsecurity AS rls_enabled,\n  c.relforcerowsecurity AS rls_forced,\n  CASE\n    WHEN c.relreplident = $1 THEN $2\n    WHEN c.relreplident = $3 THEN $4\n    WHEN c.relreplident = $5 THEN $6\n    ELSE $7\n  END AS replica_identity,\n  pg_total_relation_size(format($8, nc.nspname, c.relname)) :: int8 AS bytes,\n  pg_size_pretty(\n    pg_total_relation_size(format($9, nc.nspname, c.relname))\n  ) AS size,\n  pg_stat_get_live_tuples(c.oid) AS live_rows_estimate,\n  pg_stat_get_dead_tuples(c.oid) AS dead_rows_estimate,\n  obj_description(c.oid) AS comment,\n  coalesce(pk.primary_keys, $10) as primary_keys,\n  coalesce(\n    jsonb_agg(relationships) filter (where relationships is not null),\n    $11\n  ) as relationships\nFROM\n  pg_namespace nc\n  JOIN pg_class c ON nc.oid = c.relnamespace\n  left join (\n    select\n      c.oid::int8 as table_id,\n      jsonb_agg(\n        jsonb_build_object(\n          $12, c.oid::int8,\n          $13, n.nspname,\n          $14, c.relname,\n          $15, a.attname\n        )\n        order by array_position(i.indkey, a.attnum)\n      ) as primary_keys\n    from\n      pg_index i\n      join pg_class c on i.indrelid = c.oid\n      join pg_namespace n on c.relnamespace = n.oid\n      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(i.indkey)\n    where\n      i.indisprimary\n    group by c.oid\n  ) as pk\n  on pk.table_id = c.oid\n  left join (\n    select\n      c.oid :: int8 as id,\n      c.conname as constraint_name,\n      nsa.nspname as source_schema,\n      csa.relname as source_table_name,\n      sa.attname as source_column_name,\n      nta.nspname as target_table_schema,\n      cta.relname as target_table_name,\n      ta.attname as target_column_name\n    from\n      pg_constraint c\n    join (\n      pg_attribute sa\n      join pg_class csa on sa.attrelid = csa.oid\n      join pg_namespace nsa on csa.relnamespace = nsa.oid\n    ) on sa.attrelid = c.conrelid and sa.attnum = any (c.conkey)\n    join (\n      pg_attribute ta\n      join pg_class cta on ta.attrelid = cta.oid\n      join pg_namespace nta on cta.relnamespace = nta.oid\n    ) on ta.attrelid = c.confrelid and ta.attnum = any (c.confkey)\n    where\n      c.contype = $16\n  ) as relationships\n  on (relationships.source_schema = nc.nspname and relationships.source_table_name = c.relname)\n  or (relationships.target_table_schema = nc.nspname and relationships.target_table_name = c.relname)\nWHERE\n  c.relkind IN ($17, $18)\n  AND NOT pg_is_other_temp_schema(nc.oid)\n  AND (\n    pg_has_role(c.relowner, $19)\n    OR has_table_privilege(\n      c.oid,\n      $20\n    )\n    OR has_any_column_privilege(c.oid, $21)\n  )\ngroup by\n  c.oid,\n  c.relname,\n  c.relrowsecurity,\n  c.relforcerowsecurity,\n  c.relreplident,\n  nc.nspname,\n  pk.primary_keys\n)\n  , columns as (\n-- Adapted from information_schema.columns\n\nSELECT\n  c.oid :: int8 AS table_id,\n  nc.nspname AS schema,\n  c.relname AS table,\n  (c.oid || $22 || a.attnum) AS id,\n  a.attnum AS ordinal_position,\n  a.attname AS name,\n  CASE\n    WHEN a.atthasdef THEN pg_get_expr(ad.adbin, ad.adrelid)\n    ELSE $23\n  END AS default_value,\n  CASE\n    WHEN t.typtype = $24 THEN CASE\n      WHEN bt.typelem <> $25 :: oid\n      AND bt.typlen = $26 THEN $27\n      WHEN nbt.nspname = $28 THEN format_type(t.typbasetype, $29)\n      ELSE $30\n    END\n    ELSE CASE\n      WHEN t.typelem <> $31 :: oid\n      AND t.typlen = $32 THEN $33\n      WHEN nt.nspname = $34 THEN format_type(a.atttypid, $35)\n      ELSE $36\n    END\n  END AS data_type,\n  COALESCE(bt.typname, t.typname) AS format,\n  a.attidentity IN ($37, $38) AS is_identity,\n  CASE\n    a.attidentity\n    WHEN $39 THEN $40\n    WHEN $41 THEN $42\n    ELSE $43\n  END AS identity_generation,\n  a.attgenerated IN ($44) AS is_generated,\n  NOT (\n    a.attnotnull\n    OR t.typtype = $45 AND t.typnotnull\n  ) AS is_nullable,\n  (\n    c.relkind IN ($46, $47)\n    OR c.relkind IN ($48, $49) AND pg_column_is_updatable(c.oid, a.attnum, $50)\n  ) AS is_updatable,\n  uniques.table_id IS NOT NULL AS is_unique,\n  check_constraints.definition AS \"check\",\n  array_to_json(\n    array(\n      SELECT\n        enumlabel\n      FROM\n        pg_catalog.pg_enum enums\n      WHERE\n        enums.enumtypid = coalesce(bt.oid, t.oid)\n        OR enums.enumtypid = coalesce(bt.typelem, t.typelem)\n      ORDER BY\n        enums.enumsortorder\n    )\n  ) AS enums,\n  col_description(c.oid, a.attnum) AS comment\nFROM\n  pg_attribute a\n  LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid\n  AND a.attnum = ad.adnum\n  JOIN (\n    pg_class c\n    JOIN pg_namespace nc ON c.relnamespace = nc.oid\n  ) ON a.attrelid = c.oid\n  JOIN (\n    pg_type t\n    JOIN pg_namespace nt ON t.typnamespace = nt.oid\n  ) ON a.atttypid = t.oid\n  LEFT JOIN (\n    pg_type bt\n    JOIN pg_namespace nbt ON bt.typnamespace = nbt.oid\n  ) ON t.typtype = $51\n  AND t.typbasetype = bt.oid\n  LEFT JOIN (\n    SELECT DISTINCT ON (table_id, ordinal_position)\n      conrelid AS table_id,\n      conkey[$52] AS ordinal_position\n    FROM pg_catalog.pg_constraint\n    WHERE contype = $53 AND cardinality(conkey) = $54\n  ) AS uniques ON uniques.table_id = c.oid AND uniques.ordinal_position = a.attnum\n  LEFT JOIN (\n    -- We only select the first column check\n    SELECT DISTINCT ON (table_id, ordinal_position)\n      conrelid AS table_id,\n      conkey[$55] AS ordinal_position,\n      substring(\n        pg_get_constraintdef(pg_constraint.oid, $56),\n        $57,\n        length(pg_get_constraintdef(pg_constraint.oid, $58)) - $59\n      ) AS \"definition\"\n    FROM pg_constraint\n    WHERE contype = $60 AND cardinality(conkey) = $61\n    ORDER BY table_id, ordinal_position, oid asc\n  ) AS check_constraints ON check_constraints.table_id = c.oid AND check_constraints.ordinal_position = a.attnum\nWHERE\n  NOT pg_is_other_temp_schema(nc.oid)\n  AND a.attnum > $62\n  AND NOT a.attisdropped\n  AND (c.relkind IN ($63, $64, $65, $66, $67))\n  AND (\n    pg_has_role(c.relowner, $68)\n    OR has_column_privilege(\n      c.oid,\n      a.attnum,\n      $69\n    )\n  )\n)\n  select\n    *\n    , \nCOALESCE(\n  (\n    SELECT\n      array_agg(row_to_json(columns)) FILTER (WHERE columns.table_id = tables.id)\n    FROM\n      columns\n  ),\n  $70\n) AS columns\n  from tables where name = $71 and schema = $72",
    "rolname": "postgres",
    "calls": 16,
    "mean_time": 73.753122,
    "min_time": 41.461841,
    "max_time": 135.56867,
    "total_time": 1180.049952,
    "rows_read": 16,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.8654081254795758,
    "index_advisor_result": null
  },
  {
    "query": "SELECT\n    tbl.schemaname,\n    tbl.tablename,\n    tbl.quoted_name,\n    tbl.is_table,\n    json_agg(a) as columns\n  FROM\n    (\n      SELECT\n        n.nspname as schemaname,\n        c.relname as tablename,\n        (quote_ident(n.nspname) || $1 || quote_ident(c.relname)) as quoted_name,\n        $2 as is_table\n      FROM\n        pg_catalog.pg_class c\n        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace\n      WHERE\n        c.relkind = $3\n        AND n.nspname not in ($4, $5, $6)\n        AND n.nspname not like $7\n        AND n.nspname not like $8\n        AND has_schema_privilege(n.oid, $9) = $10\n        AND has_table_privilege(quote_ident(n.nspname) || $11 || quote_ident(c.relname), $12) = $13\n      union all\n      SELECT\n        n.nspname as schemaname,\n        c.relname as tablename,\n        (quote_ident(n.nspname) || $14 || quote_ident(c.relname)) as quoted_name,\n        $15 as is_table\n      FROM\n        pg_catalog.pg_class c\n        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace\n      WHERE\n        c.relkind in ($16, $17)\n        AND n.nspname not in ($18, $19, $20)\n        AND n.nspname not like $21\n        AND n.nspname not like $22\n        AND has_schema_privilege(n.oid, $23) = $24\n        AND has_table_privilege(quote_ident(n.nspname) || $25 || quote_ident(c.relname), $26) = $27\n    ) as tbl\n    LEFT JOIN (\n      SELECT\n        attrelid,\n        attname,\n        format_type(atttypid, atttypmod) as data_type,\n        attnum,\n        attisdropped\n      FROM\n        pg_attribute\n    ) as a ON (\n      a.attrelid = tbl.quoted_name::regclass\n      AND a.attnum > $28\n      AND NOT a.attisdropped\n      AND has_column_privilege(tbl.quoted_name, a.attname, $29)\n    )\n  \n  GROUP BY schemaname, tablename, quoted_name, is_table",
    "rolname": "postgres",
    "calls": 58,
    "mean_time": 19.1675011034483,
    "min_time": 6.645136,
    "max_time": 77.975174,
    "total_time": 1111.715064,
    "rows_read": 3232,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.8152936644529828,
    "index_advisor_result": null
  },
  {
    "query": "WITH\n-- Recursively get the base types of domains\nbase_types AS (\n  WITH RECURSIVE\n  recurse AS (\n    SELECT\n      oid,\n      typbasetype,\n      typnamespace AS base_namespace,\n      COALESCE(NULLIF(typbasetype, $2), oid) AS base_type\n    FROM pg_type\n    UNION\n    SELECT\n      t.oid,\n      b.typbasetype,\n      b.typnamespace AS base_namespace,\n      COALESCE(NULLIF(b.typbasetype, $3), b.oid) AS base_type\n    FROM recurse t\n    JOIN pg_type b ON t.typbasetype = b.oid\n  )\n  SELECT\n    oid,\n    base_namespace,\n    base_type\n  FROM recurse\n  WHERE typbasetype = $4\n),\ncolumns AS (\n    SELECT\n        c.oid AS relid,\n        a.attname::name AS column_name,\n        d.description AS description,\n        -- typbasetype and typdefaultbin handles `CREATE DOMAIN .. DEFAULT val`,  attidentity/attgenerated handles generated columns, pg_get_expr gets the default of a column\n        CASE\n          WHEN (t.typbasetype != $5) AND (ad.adbin IS NULL) THEN pg_get_expr(t.typdefaultbin, $6)\n          WHEN a.attidentity  = $7 THEN format($8, seq.objid::regclass)\n          WHEN a.attgenerated = $9 THEN $10\n          ELSE pg_get_expr(ad.adbin, ad.adrelid)::text\n        END AS column_default,\n        not (a.attnotnull OR t.typtype = $11 AND t.typnotnull) AS is_nullable,\n        CASE\n            WHEN t.typtype = $12 THEN\n            CASE\n                WHEN bt.base_namespace = $13::regnamespace THEN format_type(bt.base_type, $14::integer)\n                ELSE format_type(a.atttypid, a.atttypmod)\n            END\n            ELSE\n            CASE\n                WHEN t.typnamespace = $15::regnamespace THEN format_type(a.atttypid, $16::integer)\n                ELSE format_type(a.atttypid, a.atttypmod)\n            END\n        END::text AS data_type,\n        format_type(a.atttypid, a.atttypmod)::text AS nominal_data_type,\n        information_schema._pg_char_max_length(\n            information_schema._pg_truetypid(a.*, t.*),\n            information_schema._pg_truetypmod(a.*, t.*)\n        )::integer AS character_maximum_length,\n        bt.base_type,\n        a.attnum::integer AS position\n    FROM pg_attribute a\n        LEFT JOIN pg_description AS d\n            ON d.objoid = a.attrelid and d.objsubid = a.attnum and d.classoid = $17::regclass\n        LEFT JOIN pg_attrdef ad\n            ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum\n        JOIN pg_class c\n            ON a.attrelid = c.oid\n        JOIN pg_type t\n            ON a.atttypid = t.oid\n        LEFT JOIN base_types bt\n            ON t.oid = bt.oid\n        LEFT JOIN pg_depend seq\n            ON seq.refobjid = a.attrelid and seq.refobjsubid = a.attnum and seq.deptype = $18\n    WHERE\n        NOT pg_is_other_temp_schema(c.relnamespace)\n        AND a.attnum > $19\n        AND NOT a.attisdropped\n        AND c.relkind in ($20, $21, $22, $23, $24)\n        AND c.relnamespace = ANY($1::regnamespace[])\n),\ncolumns_agg AS (\n  SELECT\n    relid,\n    array_agg(row(\n      column_name,\n      description,\n      is_nullable::boolean,\n      data_type,\n      nominal_data_type,\n      character_maximum_length,\n      column_default,\n      coalesce(\n        (SELECT array_agg(enumlabel ORDER BY enumsortorder) FROM pg_enum WHERE enumtypid = base_type),\n        $25\n      )\n    ) order by position) as columns\n  FROM columns\n  GROUP BY relid\n),\ntbl_pk_cols AS (\n  SELECT\n    r.oid AS relid,\n    array_agg(a.attname ORDER BY a.attname) AS pk_cols\n  FROM pg_class r\n  JOIN pg_constraint c\n    ON r.oid = c.conrelid\n  JOIN pg_attribute a\n    ON a.attrelid = r.oid AND a.attnum = ANY (c.conkey)\n  WHERE\n    c.contype in ($26)\n    AND r.relkind IN ($27, $28)\n    AND r.relnamespace NOT IN ($29::regnamespace, $30::regnamespace)\n    AND NOT pg_is_other_temp_schema(r.relnamespace)\n    AND NOT a.attisdropped\n  GROUP BY r.oid\n)\nSELECT\n  n.nspname AS table_schema,\n  c.relname AS table_name,\n  d.description AS table_description,\n  c.relkind IN ($31,$32) as is_view,\n  (\n    c.relkind IN ($33,$34)\n    OR (\n      c.relkind in ($35,$36)\n      -- The function `pg_relation_is_updateable` returns a bitmask where 8\n      -- corresponds to `1 << CMD_INSERT` in the PostgreSQL source code, i.e.\n      -- it's possible to insert into the relation.\n      AND (pg_relation_is_updatable(c.oid::regclass, $37) & $38) = $39\n    )\n  ) AS insertable,\n  (\n    c.relkind IN ($40,$41)\n    OR (\n      c.relkind in ($42,$43)\n      -- CMD_UPDATE\n      AND (pg_relation_is_updatable(c.oid::regclass, $44) & $45) = $46\n    )\n  ) AS updatable,\n  (\n    c.relkind IN ($47,$48)\n    OR (\n      c.relkind in ($49,$50)\n      -- CMD_DELETE\n      AND (pg_relation_is_updatable(c.oid::regclass, $51) & $52) = $53\n    )\n  ) AS deletable,\n  coalesce(tpks.pk_cols, $54) as pk_cols,\n  coalesce(cols_agg.columns, $55) as columns\nFROM pg_class c\nJOIN pg_namespace n ON n.oid = c.relnamespace\nLEFT JOIN pg_description d on d.objoid = c.oid and d.objsubid = $56 and d.classoid = $57::regclass\nLEFT JOIN tbl_pk_cols tpks ON c.oid = tpks.relid\nLEFT JOIN columns_agg cols_agg ON c.oid = cols_agg.relid\nWHERE c.relkind IN ($58,$59,$60,$61,$62)\nAND c.relnamespace NOT IN ($63::regnamespace, $64::regnamespace)\nAND not c.relispartition\nORDER BY table_schema, table_name",
    "rolname": "authenticator",
    "calls": 33,
    "mean_time": 22.7621463030303,
    "min_time": 2.506426,
    "max_time": 67.223273,
    "total_time": 751.150828,
    "rows_read": 1553,
    "cache_hit_rate": "99.7363299642162094",
    "prop_total_time": 0.5508682313915396,
    "index_advisor_result": null
  },
  {
    "query": "SELECT case when pg_is_in_recovery() then $2 else (pg_walfile_name_offset(lsn)).file_name end, lsn::text, pg_is_in_recovery() FROM pg_backup_start($1, $3) lsn",
    "rolname": "supabase_admin",
    "calls": 5,
    "mean_time": 123.4143734,
    "min_time": 14.787952,
    "max_time": 226.517964,
    "total_time": 617.071867,
    "rows_read": 5,
    "cache_hit_rate": "0",
    "prop_total_time": 0.4525393241206217,
    "index_advisor_result": null
  },
  {
    "query": "INSERT INTO \"refresh_tokens\" (\"created_at\", \"instance_id\", \"parent\", \"revoked\", \"session_id\", \"token\", \"updated_at\", \"user_id\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning id",
    "rolname": "supabase_auth_admin",
    "calls": 119,
    "mean_time": 4.60562142016807,
    "min_time": 0.088962,
    "max_time": 32.799163,
    "total_time": 548.068949,
    "rows_read": 119,
    "cache_hit_rate": "99.8851729582316636",
    "prop_total_time": 0.4019349528244811,
    "index_advisor_result": null
  },
  {
    "query": "with base_table_info as ( select c.oid::int8 as id, nc.nspname as schema, c.relname as name, c.relkind, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced, c.relreplident, c.relowner, obj_description(c.oid) as comment, fs.srvname as foreign_server_name, fdw.fdwname as foreign_data_wrapper_name, fdw_handler.proname as foreign_data_wrapper_handler from pg_class c join pg_namespace nc on nc.oid = c.relnamespace left join pg_foreign_table ft on ft.ftrelid = c.oid left join pg_foreign_server fs on fs.oid = ft.ftserver left join pg_foreign_data_wrapper fdw on fdw.oid = fs.srvfdw left join pg_proc fdw_handler on fdw.fdwhandler = fdw_handler.oid where c.oid = $1 and not pg_is_other_temp_schema(nc.oid) and ( pg_has_role(c.relowner, $2) or has_table_privilege( c.oid, $3 ) or has_any_column_privilege(c.oid, $4) ) ), table_stats as ( select b.id, case when b.relreplident = $5 then $6 when b.relreplident = $7 then $8 when b.relreplident = $9 then $10 else $11 end as replica_identity, pg_total_relation_size(format($12, b.schema, b.name))::int8 as bytes, pg_size_pretty(pg_total_relation_size(format($13, b.schema, b.name))) as size, pg_stat_get_live_tuples(b.id) as live_rows_estimate, pg_stat_get_dead_tuples(b.id) as dead_rows_estimate from base_table_info b where b.relkind in ($14, $15) ), primary_keys as ( select i.indrelid as table_id, jsonb_agg( jsonb_build_object( $16, n.nspname, $17, c.relname, $18, i.indrelid::int8, $19, a.attname ) order by array_position(i.indkey, a.attnum) ) as primary_keys from pg_index i join pg_class c on i.indrelid = c.oid join pg_namespace n on c.relnamespace = n.oid join pg_attribute a on a.attrelid = c.oid and a.attnum = any(i.indkey) where i.indisprimary group by i.indrelid ), index_cols as ( select i.indrelid as table_id, i.indkey, array_agg( a.attname order by array_position(i.indkey, a.attnum) ) as columns from pg_index i join pg_class c on i.indrelid = c.oid join pg_attribute a on a.attrelid = c.oid and a.attnum = any(i.indkey) where i.indisunique and i.indisprimary = $20 group by i.indrelid, i.indkey ), unique_indexes as ( select ic.table_id, jsonb_agg( jsonb_build_object( $21, n.nspname, $22, c.relname, $23, ic.table_id::int8, $24, ic.columns ) ) as unique_indexes from index_cols ic join pg_class c on c.oid = ic.table_id join pg_namespace n on n.oid = c.relnamespace group by ic.table_id ), relationships as ( select c.conrelid as source_id, c.confrelid as target_id, jsonb_build_object( $25, c.oid::int8, $26, c.conname, $27, c.confdeltype, $28, c.confupdtype, $29, nsa.nspname, $30, csa.relname, $31, sa.attname, $32, nta.nspname, $33, cta.relname, $34, ta.attname ) as rel_info from pg_constraint c join pg_class csa on c.conrelid = csa.oid join pg_namespace nsa on csa.relnamespace = nsa.oid join pg_attribute sa on (sa.attrelid = c.conrelid and sa.attnum = any(c.conkey)) join pg_class cta on c.confrelid = cta.oid join pg_namespace nta on cta.relnamespace = nta.oid join pg_attribute ta on (ta.attrelid = c.confrelid and ta.attnum = any(c.confkey)) where c.contype = $35 ), columns as ( select a.attrelid as table_id, jsonb_agg(jsonb_build_object( $36, (a.attrelid || $37 || a.attnum), $38, c.oid::int8, $39, nc.nspname, $40, c.relname, $41, a.attnum, $42, a.attname, $43, case when a.atthasdef then pg_get_expr(ad.adbin, ad.adrelid) else $44 end, $45, case when t.typtype = $46 then case when bt.typelem <> $47::oid and bt.typlen = $48 then $49 when nbt.nspname = $50 then format_type(t.typbasetype, $51) else $52 end else case when t.typelem <> $53::oid and t.typlen = $54 then $55 when nt.nspname = $56 then format_type(a.atttypid, $57) else $58 end end, $59, case when t.typtype = $60 then case when nt.nspname <> $61 then concat(nt.nspname, $62, coalesce(bt.typname, t.typname)) else coalesce(bt.typname, t.typname) end else coalesce(bt.typname, t.typname) end, $63, a.attidentity in ($64, $65), $66, case a.attidentity when $67 then $68 when $69 then $70 else $71 end, $72, a.attgenerated in ($73), $74, not (a.attnotnull or t.typtype = $75 and t.typnotnull), $76, ( b.relkind in ($77, $78) or (b.relkind in ($79, $80) and pg_column_is_updatable(b.id, a.attnum, $81)) ), $82, uniques.table_id is not null, $83, check_constraints.definition, $84, col_description(c.oid, a.attnum), $85, coalesce( ( select jsonb_agg(e.enumlabel order by e.enumsortorder) from pg_catalog.pg_enum e where e.enumtypid = coalesce(bt.oid, t.oid) or e.enumtypid = coalesce(bt.typelem, t.typelem) ), $86::jsonb ) ) order by a.attnum) as columns from pg_attribute a join base_table_info b on a.attrelid = b.id join pg_class c on a.attrelid = c.oid join pg_namespace nc on c.relnamespace = nc.oid left join pg_attrdef ad on (a.attrelid = ad.adrelid and a.attnum = ad.adnum) join pg_type t on a.atttypid = t.oid join pg_namespace nt on t.typnamespace = nt.oid left join pg_type bt on (t.typtype = $87 and t.typbasetype = bt.oid) left join pg_namespace nbt on bt.typnamespace = nbt.oid left join ( select conrelid as table_id, conkey[$88] as ordinal_position from pg_catalog.pg_constraint where contype = $89 and cardinality(conkey) = $90 group by conrelid, conkey[1] ) as uniques on uniques.table_id = a.attrelid and uniques.ordinal_position = a.attnum left join ( select distinct on (conrelid, conkey[1]) conrelid as table_id, conkey[$91] as ordinal_position, substring( pg_get_constraintdef(oid, $92), $93, length(pg_get_constraintdef(oid, $94)) - $95 ) as definition from pg_constraint where contype = $96 and cardinality(conkey) = $97 order by conrelid, conkey[1], oid asc ) as check_constraints on check_constraints.table_id = a.attrelid and check_constraints.ordinal_position = a.attnum where a.attnum > $98 and not a.attisdropped group by a.attrelid ) select case b.relkind when $99 then jsonb_build_object( $100, b.relkind, $101, b.id, $102, b.schema, $103, b.name, $104, b.rls_enabled, $105, b.rls_forced, $106, ts.replica_identity, $107, ts.bytes, $108, ts.size, $109, ts.live_rows_estimate, $110, ts.dead_rows_estimate, $111, b.comment, $112, coalesce(pk.primary_keys, $113::jsonb), $114, coalesce(ui.unique_indexes, $115::jsonb), $116, coalesce( (select jsonb_agg(r.rel_info) from relationships r where r.source_id = b.id or r.target_id = b.id), $117::jsonb ), $118, coalesce(c.columns, $119::jsonb) ) when $120 then jsonb_build_object( $121, b.relkind, $122, b.id, $123, b.schema, $124, b.name, $125, b.rls_enabled, $126, b.rls_forced, $127, ts.replica_identity, $128, ts.bytes, $129, ts.size, $130, ts.live_rows_estimate, $131, ts.dead_rows_estimate, $132, b.comment, $133, coalesce(pk.primary_keys, $134::jsonb), $135, coalesce(ui.unique_indexes, $136::jsonb), $137, coalesce( (select jsonb_agg(r.rel_info) from relationships r where r.source_id = b.id or r.target_id = b.id), $138::jsonb ), $139, coalesce(c.columns, $140::jsonb) ) when $141 then jsonb_build_object( $142, b.relkind, $143, b.id, $144, b.schema, $145, b.name, $146, (pg_relation_is_updatable(b.id, $147) & $148) = $149, $150, b.comment, $151, coalesce(c.columns, $152::jsonb) ) when $153 then jsonb_build_object( $154, b.relkind, $155, b.id, $156, b.schema, $157, b.name, $158, $159, $160, b.comment, $161, coalesce(c.columns, $162::jsonb) ) when $163 then jsonb_build_object( $164, b.relkind, $165, b.id, $166, b.schema, $167, b.name, $168, b.comment, $169, b.foreign_server_name, $170, b.foreign_data_wrapper_name, $171, b.foreign_data_wrapper_handler, $172, coalesce(c.columns, $173::jsonb) ) end as entity from base_table_info b left join table_stats ts on b.id = ts.id left join primary_keys pk on b.id = pk.table_id left join unique_indexes ui on b.id = ui.table_id left join columns c on b.id = c.table_id",
    "rolname": "postgres",
    "calls": 36,
    "mean_time": 14.4224660277778,
    "min_time": 8.905762,
    "max_time": 56.609229,
    "total_time": 519.208777,
    "rows_read": 36,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.38076989340542183,
    "index_advisor_result": null
  },
  {
    "query": "INSERT INTO \"sessions\" (\"aal\", \"created_at\", \"factor_id\", \"id\", \"ip\", \"not_after\", \"oauth_client_id\", \"refresh_token_counter\", \"refresh_token_hmac_key\", \"refreshed_at\", \"scopes\", \"tag\", \"updated_at\", \"user_agent\", \"user_id\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
    "rolname": "supabase_auth_admin",
    "calls": 109,
    "mean_time": 4.57988786238532,
    "min_time": 0.133746,
    "max_time": 30.215801,
    "total_time": 499.207777,
    "rows_read": 109,
    "cache_hit_rate": "99.9174236168455822",
    "prop_total_time": 0.36610184660928324,
    "index_advisor_result": null
  },
  {
    "query": "SELECT t.oid, t.typname, t.typsend, t.typreceive, t.typoutput, t.typinput,\n       coalesce(d.typelem, t.typelem), coalesce(r.rngsubtype, $1), ARRAY (\n  SELECT a.atttypid\n  FROM pg_attribute AS a\n  WHERE a.attrelid = t.typrelid AND a.attnum > $2 AND NOT a.attisdropped\n  ORDER BY a.attnum\n)\n\nFROM pg_type AS t\nLEFT JOIN pg_type AS d ON t.typbasetype = d.oid\nLEFT JOIN pg_range AS r ON r.rngtypid = t.oid OR r.rngmultitypid = t.oid OR (t.typbasetype <> $3 AND r.rngtypid = t.typbasetype)\nWHERE (t.typrelid = $4)\nAND (t.typelem = $5 OR NOT EXISTS (SELECT $6 FROM pg_catalog.pg_type s WHERE s.typrelid != $7 AND s.oid = t.typelem))",
    "rolname": "supabase_admin",
    "calls": 6,
    "mean_time": 80.5767643333333,
    "min_time": 4.882733,
    "max_time": 127.424619,
    "total_time": 483.460586,
    "rows_read": 1358,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.3545533973069618,
    "index_advisor_result": null
  },
  {
    "query": "with base as (\n          select\n            auth.rolname,\n            statements.query,\n            statements.calls,\n            statements.total_exec_time + statements.total_plan_time as total_time,\n            statements.min_exec_time + statements.min_plan_time as min_time,\n            statements.max_exec_time + statements.max_plan_time as max_time,\n            statements.mean_exec_time + statements.mean_plan_time as mean_time,\n            coalesce(statements.rows::numeric / nullif(statements.calls, $1), $2) as avg_rows,\n            statements.rows as rows_read,\n            statements.shared_blks_hit as debug_hit,\n            statements.shared_blks_read as debug_read,\n            case\n              when (statements.shared_blks_hit + statements.shared_blks_read) > $3\n              then (statements.shared_blks_hit::numeric * $4) /\n                   (statements.shared_blks_hit + statements.shared_blks_read)\n              else $5\n            end as cache_hit_rate,\n            coalesce(\n              ((statements.total_exec_time + statements.total_plan_time) /\n                nullif(sum(statements.total_exec_time + statements.total_plan_time) OVER(), $6)) *\n                $7,\n              $8\n            ) as prop_total_time\n          from pg_stat_statements as statements\n            inner join pg_authid as auth on statements.userid = auth.oid\n          \n          order by total_time desc\n          limit $9\n        ),\n        query_results as (\n          select\n            base.*,\n            case\n              when (lower(base.query) like $10 or lower(base.query) like $11)\n              then (\n                select json_build_object(\n                  $12, array_length(index_statements, $13) > $14,\n                  $15, startup_cost_before,\n                  $16, startup_cost_after,\n                  $17, total_cost_before,\n                  $18, total_cost_after,\n                  $19, index_statements\n                )\n                from index_advisor(base.query)\n              )\n              else $20\n            end as index_advisor_result\n          from base\n        )\n        select *\n        from query_results\n        \n        order by total_time desc\n        limit $21\n\n-- source: dashboard\n-- user: b2717e53-20c6-4785-9935-ba071e063a5f\n-- date: 2026-01-25T02:24:36.499Z",
    "rolname": "postgres",
    "calls": 1,
    "mean_time": 443.500555,
    "min_time": 443.500555,
    "max_time": 443.500555,
    "total_time": 443.500555,
    "rows_read": 20,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.32524808233855296,
    "index_advisor_result": null
  },
  {
    "query": "select set_config('search_path', $1, true), set_config($2, $3, true), set_config('role', $4, true), set_config('request.jwt.claims', $5, true), set_config('request.method', $6, true), set_config('request.path', $7, true), set_config('request.headers', $8, true), set_config('request.cookies', $9, true)",
    "rolname": "authenticated",
    "calls": 2345,
    "mean_time": 0.156520009381663,
    "min_time": 0.021883,
    "max_time": 19.105451,
    "total_time": 367.039422,
    "rows_read": 2345,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.26917411219057186,
    "index_advisor_result": null
  },
  {
    "query": "-- Adapted from information_schema.schemata\n\nselect\n  n.oid as id,\n  n.nspname as name,\n  u.rolname as owner,\n   obj_description(n.oid, $1) AS comment\nfrom\n  pg_namespace n,\n  pg_roles u\nwhere\n  n.nspowner = u.oid\n  and (\n    pg_has_role(n.nspowner, $2)\n    or has_schema_privilege(n.oid, $3)\n  )\n  and not pg_catalog.starts_with(n.nspname, $4)\n  and not pg_catalog.starts_with(n.nspname, $5)\n and not (n.nspname in ($6,$7,$8))\n\n-- source: dashboard\n-- user: b2717e53-20c6-4785-9935-ba071e063a5f\n-- date: 2026-01-22T09:50:15.746Z",
    "rolname": "postgres",
    "calls": 79,
    "mean_time": 4.64111805063291,
    "min_time": 0.862764,
    "max_time": 20.35269,
    "total_time": 366.648326,
    "rows_read": 711,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.2688872958099018,
    "index_advisor_result": null
  },
  {
    "query": "DELETE FROM sessions WHERE user_id = $1",
    "rolname": "supabase_auth_admin",
    "calls": 75,
    "mean_time": 4.80984565333333,
    "min_time": 0.08472,
    "max_time": 35.397849,
    "total_time": 360.738424,
    "rows_read": 107,
    "cache_hit_rate": "100.0000000000000000",
    "prop_total_time": 0.2645531765610346,
    "index_advisor_result": null
  },
  {
    "query": "WITH pgrst_source AS ( SELECT \"public\".\"modules\".*, COALESCE( \"modules_lessons_1\".\"modules_lessons_1\", $6) AS \"lessons\" FROM \"public\".\"modules\" LEFT JOIN LATERAL ( SELECT json_agg(\"modules_lessons_1\")::jsonb AS \"modules_lessons_1\" FROM (SELECT \"lessons_1\".* FROM \"public\".\"lessons\" AS \"lessons_1\" WHERE \"lessons_1\".\"module_id\" = \"public\".\"modules\".\"id\"   LIMIT $1 OFFSET $2 ) AS \"modules_lessons_1\" ) AS \"modules_lessons_1\" ON $7 WHERE  \"public\".\"modules\".\"course_id\" = $3  ORDER BY \"public\".\"modules\".\"sort_order\" ASC  LIMIT $4 OFFSET $5 )  SELECT $8::bigint AS total_result_set, pg_catalog.count(_postgrest_t) AS page_total, coalesce(json_agg(_postgrest_t), $9) AS body, nullif(current_setting($10, $11), $12) AS response_headers, nullif(current_setting($13, $14), $15) AS response_status, $16 AS response_inserted FROM ( SELECT * FROM pgrst_source ) _postgrest_t",
    "rolname": "authenticated",
    "calls": 84,
    "mean_time": 3.6809980952381,
    "min_time": 0.024042,
    "max_time": 30.837755,
    "total_time": 309.20384,
    "rows_read": 84,
    "cache_hit_rate": "99.9942112879884226",
    "prop_total_time": 0.22675948175919813,
    "index_advisor_result": null
  }
]"}



SECURITY ADVISOR  WARNINGS:
18 ERRORS AND 2 WARNINGS:
{"
[
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.coupons\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Admins can manage coupons\",\"Users can validate coupons\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_coupons"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.courses\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Instructors can delete own courses\",\"Instructors can insert courses\",\"Instructors can update own courses\",\"Instructors can view own courses\",\"Public can view published courses\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_courses"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.deletion_requests\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Admins can manage deletion requests\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "deletion_requests",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_deletion_requests"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.enrollments\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Instructors can view enrollments for their courses\",\"Staff can manage enrollments\",\"Staff can view all enrollments\",\"Users can enroll themselves\",\"Users can view own enrollments\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_enrollments"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.organizations\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Admins can update organization\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "organizations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_organizations"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.services\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Admins can manage services\",\"Public can view services\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_services"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.support_tickets\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Support/Admin can update tickets\",\"Support/Admin can view all tickets\",\"Users can create tickets\",\"Users can view own tickets\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_support_tickets"
  },
  {
    "name": "policy_exists_rls_disabled",
    "title": "Policy Exists RLS Disabled",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) policies have been created, but RLS has not been enabled for the underlying table.",
    "detail": "Table \\`public.users\\` has RLS policies but RLS is not enabled on the table. Policies include {\"Admins can update user roles\",\"Admins can view all users\",\"Staff can view all users\",\"Users can view own data\"}.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0007_policy_exists_rls_disabled",
    "metadata": {
      "name": "users",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "policy_exists_rls_disabled_public_users"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.organizations\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "organizations",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_organizations"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.users\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "users",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_users"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.deletion_requests\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "deletion_requests",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_deletion_requests"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.courses\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_courses"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.enrollments\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_enrollments"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.products\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "products",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_products"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.support_tickets\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_support_tickets"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.coupons\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_coupons"
  },
  {
    "name": "rls_disabled_in_public",
    "title": "RLS Disabled in Public",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgREST",
    "detail": "Table \\`public.services\\` is public, but RLS has not been enabled.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "rls_disabled_in_public_public_services"
  },
  {
    "name": "sensitive_columns_exposed",
    "title": "Sensitive Columns Exposed",
    "level": "ERROR",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects tables exposed via API that contain columns with potentially sensitive data (PII, credentials, financial info) without RLS protection.",
    "detail": "Table `public.courses` is exposed via API without RLS and contains potentially sensitive column(s): certificate. This may lead to data exposure.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0023_sensitive_columns_exposed",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public",
      "matched_patterns": [
        "certificate"
      ],
      "sensitive_columns": [
        "certificate"
      ]
    },
    "cache_key": "sensitive_columns_exposed_public_courses"
  }
]


WARNINGS:

[
  {
    "name": "function_search_path_mutable",
    "title": "Function Search Path Mutable",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Detects functions where the search_path parameter is not set.",
    "detail": "Function \\`public.check_user_role\\` has a role mutable search_path",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable",
    "metadata": {
      "name": "check_user_role",
      "type": "function",
      "schema": "public"
    },
    "cache_key": "function_search_path_mutable_public_check_user_role_875f240bc63d36c66888d73b235dc379"
  },
  {
    "name": "auth_leaked_password_protection",
    "title": "Leaked Password Protection Disabled",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "SECURITY"
    ],
    "description": "Leaked password protection is currently disabled.",
    "detail": "Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. Enable this feature to enhance security.",
    "cache_key": "auth_leaked_password_protection",
    "remediation": "https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection",
    "metadata": {
      "type": "auth",
      "entity": "Auth"
    }
  }
]
"}


PERFORMANCE WARNINGS:
72 WARNINGS AND 14 INFO SUGGESTIONS
{"
[
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.lessons\\` has a row level security policy \\`Enrolled students can view lessons\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_lessons_Enrolled students can view lessons"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.modules\\` has a row level security policy \\`Instructors can insert modules\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "modules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_modules_Instructors can insert modules"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.completed_lessons\\` has a row level security policy \\`Users can view own completion\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "completed_lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_completed_lessons_Users can view own completion"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.modules\\` has a row level security policy \\`Instructors can update modules\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "modules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_modules_Instructors can update modules"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.modules\\` has a row level security policy \\`Instructors can delete modules\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "modules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_modules_Instructors can delete modules"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.modules\\` has a row level security policy \\`Instructors can select modules\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "modules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_modules_Instructors can select modules"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.lessons\\` has a row level security policy \\`Instructors can insert lessons\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_lessons_Instructors can insert lessons"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.lessons\\` has a row level security policy \\`Instructors can update lessons\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_lessons_Instructors can update lessons"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.lessons\\` has a row level security policy \\`Instructors can delete lessons\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_lessons_Instructors can delete lessons"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.lessons\\` has a row level security policy \\`Instructors can view own lessons\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_lessons_Instructors can view own lessons"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.completed_lessons\\` has a row level security policy \\`Users can mark lessons complete\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "completed_lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_completed_lessons_Users can mark lessons complete"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.order_items\\` has a row level security policy \\`Instructors can view order_items for their courses\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_order_items_Instructors can view order_items for their courses"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.payouts\\` has a row level security policy \\`Instructors can view own payouts\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "payouts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_payouts_Instructors can view own payouts"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.payouts\\` has a row level security policy \\`Admins can manage payouts\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "payouts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_payouts_Admins can manage payouts"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.chat_messages\\` has a row level security policy \\`Ticket participants can view messages\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "chat_messages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_chat_messages_Ticket participants can view messages"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.chat_messages\\` has a row level security policy \\`Ticket participants can send messages\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "chat_messages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_chat_messages_Ticket participants can send messages"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.orders\\` has a row level security policy \\`Users can view own orders\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_orders_Users can view own orders"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.orders\\` has a row level security policy \\`Users can create orders\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_orders_Users can create orders"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.orders\\` has a row level security policy \\`Staff can view all orders\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_orders_Staff can view all orders"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.orders\\` has a row level security policy \\`Staff can update orders\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_orders_Staff can update orders"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.order_items\\` has a row level security policy \\`Users can view own order items\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_order_items_Users can view own order items"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.order_items\\` has a row level security policy \\`Users can create order items\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_order_items_Users can create order items"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.order_items\\` has a row level security policy \\`Staff can view all order items\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_order_items_Staff can view all order items"
  },
  {
    "name": "auth_rls_initplan",
    "title": "Auth RLS Initialization Plan",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if calls to \\`current_setting()\\` and \\`auth.<function>()\\` in RLS policies are being unnecessarily re-evaluated for each row",
    "detail": "Table \\`public.service_categories\\` has a row level security policy \\`Admins can manage categories\\` that re-evaluates current_setting() or auth.<function>() for each row. This produces suboptimal query performance at scale. Resolve the issue by replacing \\`auth.<function>()\\` with \\`(select auth.<function>())\\`. See [docs](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select) for more info.",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan",
    "metadata": {
      "name": "service_categories",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "auth_rls_init_plan_public_service_categories_Admins can manage categories"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.coupons\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage coupons\",\"Users can validate coupons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_coupons_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.coupons\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage coupons\",\"Users can validate coupons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_coupons_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.coupons\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage coupons\",\"Users can validate coupons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_coupons_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.coupons\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage coupons\",\"Users can validate coupons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_coupons_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.courses\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view own courses\",\"Public can view published courses\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_courses_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.courses\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view own courses\",\"Public can view published courses\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_courses_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.courses\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view own courses\",\"Public can view published courses\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_courses_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.courses\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view own courses\",\"Public can view published courses\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_courses_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`anon\\` for action \\`INSERT\\`. Policies include \\`{\"Staff can manage enrollments\",\"Users can enroll themselves\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_anon_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view enrollments for their courses\",\"Staff can manage enrollments\",\"Staff can view all enrollments\",\"Users can view own enrollments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`authenticated\\` for action \\`INSERT\\`. Policies include \\`{\"Staff can manage enrollments\",\"Users can enroll themselves\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_authenticated_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view enrollments for their courses\",\"Staff can manage enrollments\",\"Staff can view all enrollments\",\"Users can view own enrollments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`authenticator\\` for action \\`INSERT\\`. Policies include \\`{\"Staff can manage enrollments\",\"Users can enroll themselves\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_authenticator_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view enrollments for their courses\",\"Staff can manage enrollments\",\"Staff can view all enrollments\",\"Users can view own enrollments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`INSERT\\`. Policies include \\`{\"Staff can manage enrollments\",\"Users can enroll themselves\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_dashboard_user_INSERT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.enrollments\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view enrollments for their courses\",\"Staff can manage enrollments\",\"Staff can view all enrollments\",\"Users can view own enrollments\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_enrollments_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.lessons\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Enrolled students can view lessons\",\"Instructors can view own lessons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_lessons_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.lessons\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Enrolled students can view lessons\",\"Instructors can view own lessons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_lessons_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.lessons\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Enrolled students can view lessons\",\"Instructors can view own lessons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_lessons_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.lessons\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Enrolled students can view lessons\",\"Instructors can view own lessons\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_lessons_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.order_items\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view order_items for their courses\",\"Staff can view all order items\",\"Users can view own order items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_order_items_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.order_items\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view order_items for their courses\",\"Staff can view all order items\",\"Users can view own order items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_order_items_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.order_items\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view order_items for their courses\",\"Staff can view all order items\",\"Users can view own order items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_order_items_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.order_items\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Instructors can view order_items for their courses\",\"Staff can view all order items\",\"Users can view own order items\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_order_items_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can view all orders\",\"Users can view own orders\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can view all orders\",\"Users can view own orders\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can view all orders\",\"Users can view own orders\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.orders\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Staff can view all orders\",\"Users can view own orders\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "orders",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_orders_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payouts\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payouts\",\"Instructors can view own payouts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payouts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payouts_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payouts\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payouts\",\"Instructors can view own payouts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payouts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payouts_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payouts\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payouts\",\"Instructors can view own payouts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payouts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payouts_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.payouts\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage payouts\",\"Instructors can view own payouts\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "payouts",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_payouts_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_categories\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage categories\",\"Public categories are viewable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_categories",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_categories_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_categories\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage categories\",\"Public categories are viewable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_categories",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_categories_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_categories\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage categories\",\"Public categories are viewable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_categories",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_categories_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.service_categories\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage categories\",\"Public categories are viewable\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "service_categories",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_service_categories_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.services\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage services\",\"Public can view services\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_services_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.services\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage services\",\"Public can view services\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_services_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.services\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage services\",\"Public can view services\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_services_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.services\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can manage services\",\"Public can view services\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_services_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.support_tickets\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Support/Admin can view all tickets\",\"Users can view own tickets\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_support_tickets_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.support_tickets\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Support/Admin can view all tickets\",\"Users can view own tickets\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_support_tickets_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.support_tickets\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Support/Admin can view all tickets\",\"Users can view own tickets\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_support_tickets_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.support_tickets\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Support/Admin can view all tickets\",\"Users can view own tickets\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_support_tickets_dashboard_user_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users\\` has multiple permissive policies for role \\`anon\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all users\",\"Staff can view all users\",\"Users can view own data\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_anon_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users\\` has multiple permissive policies for role \\`authenticated\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all users\",\"Staff can view all users\",\"Users can view own data\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_authenticated_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users\\` has multiple permissive policies for role \\`authenticator\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all users\",\"Staff can view all users\",\"Users can view own data\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_authenticator_SELECT"
  },
  {
    "name": "multiple_permissive_policies",
    "title": "Multiple Permissive Policies",
    "level": "WARN",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if multiple permissive row level security policies are present on a table for the same \\`role\\` and \\`action\\` (e.g. insert). Multiple permissive policies are suboptimal for performance as each policy must be executed for every relevant query.",
    "detail": "Table \\`public.users\\` has multiple permissive policies for role \\`dashboard_user\\` for action \\`SELECT\\`. Policies include \\`{\"Admins can view all users\",\"Staff can view all users\",\"Users can view own data\"}\\`",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    "metadata": {
      "name": "users",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "multiple_permissive_policies_public_users_dashboard_user_SELECT"
  }
]




INFO:
[
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_chat_messages_sender_id\\` on table \\`public.chat_messages\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "chat_messages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_chat_messages_idx_chat_messages_sender_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_chat_messages_ticket_id\\` on table \\`public.chat_messages\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "chat_messages",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_chat_messages_idx_chat_messages_ticket_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_completed_lessons_course_id\\` on table \\`public.completed_lessons\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "completed_lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_completed_lessons_idx_completed_lessons_course_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_completed_lessons_lesson_id\\` on table \\`public.completed_lessons\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "completed_lessons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_completed_lessons_idx_completed_lessons_lesson_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_coupons_created_by\\` on table \\`public.coupons\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "coupons",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_coupons_idx_coupons_created_by"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_courses_instructor_id\\` on table \\`public.courses\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "courses",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_courses_idx_courses_instructor_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_deletion_requests_instructor_id\\` on table \\`public.deletion_requests\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "deletion_requests",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_deletion_requests_idx_deletion_requests_instructor_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_enrollments_course_id\\` on table \\`public.enrollments\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "enrollments",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_enrollments_idx_enrollments_course_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_modules_course_id\\` on table \\`public.modules\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "modules",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_modules_idx_modules_course_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_order_items_order_id\\` on table \\`public.order_items\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "order_items",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_order_items_idx_order_items_order_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_service_categories_parent_id\\` on table \\`public.service_categories\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "service_categories",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_service_categories_idx_service_categories_parent_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_services_category_id\\` on table \\`public.services\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "services",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_services_idx_services_category_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_support_tickets_user_id\\` on table \\`public.support_tickets\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "support_tickets",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_support_tickets_idx_support_tickets_user_id"
  },
  {
    "name": "unused_index",
    "title": "Unused Index",
    "level": "INFO",
    "facing": "EXTERNAL",
    "categories": [
      "PERFORMANCE"
    ],
    "description": "Detects if an index has never been used and may be a candidate for removal.",
    "detail": "Index \\`idx_products_slug\\` on table \\`public.products\\` has not been used",
    "remediation": "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    "metadata": {
      "name": "products",
      "type": "table",
      "schema": "public"
    },
    "cache_key": "unused_index_public_products_idx_products_slug"
  }
]
"}