const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET,
});

exports.handler = async (event, context) => {
  try {
    const counterName = 'visits';

    // Get the existing counter
    let counter;
    try {
      counter = await client.query(
        q.Get(q.Match(q.Index('counter_by_name'), counterName))
      );
    } catch (err) {
      // If not found, create a new counter
      counter = await client.query(
        q.Create(q.Collection('counters'), { data: { name: counterName, count: 0 } })
      );
    }

    if (event.httpMethod === 'POST') {
      // Increment the counter for POST requests
      counter = await client.query(
        q.Update(counter.ref, { data: { count: q.Add(q.Select(['data', 'count'], q.Get(counter.ref)), 1) } })
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ count: counter.data.count }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process counter' }),
    };
  }
};
