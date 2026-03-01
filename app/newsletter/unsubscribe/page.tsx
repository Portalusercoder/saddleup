import Link from "next/link";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; already?: string }>;
}) {
  const params = await searchParams;
  const success = params.success === "1";
  const already = params.already === "1";
  const error = params.error;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {success && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              You&apos;ve been unsubscribed
            </h1>
            <p className="text-white/60 mb-8">
              You won&apos;t receive any more newsletters from us. You can
              resubscribe anytime from our website.
            </p>
          </>
        )}
        {already && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              Already unsubscribed
            </h1>
            <p className="text-white/60 mb-8">
              You&apos;re already off our list. No need to do anything.
            </p>
          </>
        )}
        {error && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-white/60 mb-8">
              We couldn&apos;t process your unsubscribe request. The link may be
              invalid or expired. Try again from the latest email, or contact us.
            </p>
          </>
        )}
        {!success && !already && !error && (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-normal text-white mb-4">
              Unsubscribe
            </h1>
            <p className="text-white/60 mb-8">
              Click the unsubscribe link in your newsletter email to stop
              receiving our emails.
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-white/95 transition uppercase tracking-wider text-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
