const { Pool } = require('pg');

async function main() {
  const sourceUrl = process.argv[2];
  const targetUrl = process.argv[3];

  if (!sourceUrl || !targetUrl) {
    throw new Error('Usage: node scripts/migrate-business-data-to-neon.js <source-url> <target-url>');
  }

  const sourcePool = new Pool({
    connectionString: sourceUrl,
    ssl: { rejectUnauthorized: false },
  });

  const targetPool = new Pool({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
  });

  const sourceUsers = (await sourcePool.query(
    'select id, username, password, created_at from public.users order by id'
  )).rows;
  const sourceBlogPosts = (await sourcePool.query(
    'select id, title, summary, content, created_at from public.blog_posts order by id'
  )).rows;
  const sourceGameRecords = (await sourcePool.query(
    'select id, user_id, scenario, final_score, result, played_at from public.game_records order by id'
  )).rows;

  const client = await targetPool.connect();
  try {
    await client.query('begin');
    await client.query('truncate table public.game_records, public.blog_posts, public.users restart identity cascade');

    for (const row of sourceUsers) {
      await client.query(
        'insert into public.users(id, username, password, created_at) values($1, $2, $3, $4)',
        [row.id, row.username, row.password, row.created_at]
      );
    }

    for (const row of sourceBlogPosts) {
      await client.query(
        'insert into public.blog_posts(id, title, summary, content, created_at) values($1, $2, $3, $4, $5)',
        [row.id, row.title, row.summary, row.content, row.created_at]
      );
    }

    for (const row of sourceGameRecords) {
      await client.query(
        'insert into public.game_records(id, user_id, scenario, final_score, result, played_at) values($1, $2, $3, $4, $5, $6)',
        [row.id, row.user_id, row.scenario, row.final_score, row.result, row.played_at]
      );
    }

    await client.query("select setval('public.users_id_seq', coalesce((select max(id) from public.users), 1), true)");
    await client.query("select setval('public.blog_posts_id_seq', coalesce((select max(id) from public.blog_posts), 1), true)");
    await client.query("select setval('public.game_records_id_seq', coalesce((select max(id) from public.game_records), 1), true)");
    await client.query('commit');

    console.log(
      JSON.stringify(
        {
          copied: {
            users: sourceUsers.length,
            blog_posts: sourceBlogPosts.length,
            game_records: sourceGameRecords.length,
          },
        },
        null,
        2
      )
    );
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
