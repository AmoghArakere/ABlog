export async function get() {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'API is working'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
