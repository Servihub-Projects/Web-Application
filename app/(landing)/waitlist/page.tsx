"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function WaitlistPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage(null);

    const formData = new FormData(formElement);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      useCase: String(formData.get("useCase") || "").trim(),
    };

    if (!payload.email) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to join the waitlist. Please try again.");
      }

      setStatus("success");
      setMessage("You're on the list! We'll be in touch soon.");
      toast.success("You're on the list! We'll be in touch soon.")
      formElement.reset();
    } catch (error) {
      setStatus("error");
      if (error instanceof Error) {
        setMessage(error.message || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <main className=" bg-linear-to-b from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 items-center lg:justify-center lg:min-h-[calc(100vh-80px)]">
        <section className="flex-1 max-w-xl">
          <p className="inline-flex items-center gap-2 py-2 px-4 bg-white text-orange-500 outline  outline-orange-200 rounded-2xl mb-4 shadow-lg text-xs md:text-sm">
            Be the first to experience ServiHub
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-slate-800 mb-6 font-500 leading-tight">
            Join the{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-orange-500 to-orange-700">
              early access
            </span>{" "}
            waitlist
          </h1>
          <p className="text-base md:text-lg text-slate-600 mb-6">
            Get priority access when we launch, early product updates, and a direct channel to share feedback that shapes the future of ServiHub.
          </p>
          <ul className="space-y-2 text-sm md:text-base text-slate-600">
            <li>• Priority onboarding for service providers and customers</li>
            <li>• Early access to new features and tools</li>
            <li>• Exclusive launch perks and partner offers</li>
          </ul>
        </section>

        <section className="flex-1 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2">
              Secure your spot
            </h2>
            <p className="text-sm md:text-base text-slate-500 mb-6">
              Tell us a bit about you so we can tailor the experience when we launch.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Alex Johnson"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email address<span className="text-orange-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                  Company or role
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="e.g. Independent electrician, HR manager"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-slate-700 mb-1">
                  How do you plan to use ServiHub?
                </label>
                <textarea
                  id="useCase"
                  name="useCase"
                  rows={3}
                  placeholder="Tell us briefly how ServiHub can help you."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              {message && (
                <p
                  className={`text-sm ${status === "success" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full px-4 py-2.5 rounded-lg text-sm md:text-base font-medium text-white bg-linear-to-r from-orange-500 via-red-500 to-orange-600 bg-size-[200%_100%] bg-left hover:bg-right transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                {status === "loading" ? "Joining waitlist..." : "Join the waitlist"}
              </button>

              <p className="text-[11px] md:text-xs text-slate-400 mt-2">
                We respect your inbox. You&apos;ll only hear from us about important product updates and launch details.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
