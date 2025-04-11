export default function SuccessPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-4">
        🎉 Registration Complete!
      </h1>
      <p className="text-lg mb-2">Thank you for registering.</p>
      <p className="text-md text-gray-700 mb-6">
        After we process your transaction details, you will receive an email
        with your ticket attached
      </p>

      <a href="https://rang-e-chinar.nitsri.ac.in/" className="inline-block mt-4 text-blue-600 underline">
        ← Go back to homepage
      </a>
    </main>
  );
}
