export default async function EstablishmentBookingPage(props: { params: Promise<{ wilaya: string; slug: string }> }) {
  const params = await props.params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Booking at {params.slug}</h1>
      <p className="text-xl">Located in {params.wilaya}</p>
      {/* TODO: Implement booking flow, load establishment details, etc. */}
    </main>
  );
}
