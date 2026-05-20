import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export const metadata = {
  title: 'Privacy Policy — blablabuild',
  description: 'Privacy policy van blablabuild.',
};

export default async function PrivacyPage() {
  const locale = await getLocale();
  const nl = locale !== 'en';

  return (
    <div className="min-h-screen w-full bg-[#0a0b0e] text-white">
      <div className="mx-auto w-full max-w-[760px] px-5 py-24 sm:px-8">
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-white"
        >
          ← {nl ? 'Terug' : 'Back'}
        </Link>

        <h1 className="font-host text-3xl font-medium tracking-tight text-white md:text-4xl">
          {nl ? 'Privacybeleid' : 'Privacy Policy'}
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
          {nl ? 'Laatst bijgewerkt: mei 2025' : 'Last updated: May 2025'}
        </p>

        <div className="mt-10 space-y-8 font-host text-[15px] leading-relaxed text-white/75">
          <section>
            <h2 className="mb-3 font-host text-lg font-medium text-white">
              {nl ? '1. Wie zijn wij' : '1. Who we are'}
            </h2>
            <p>
              {nl
                ? 'blablabuild is een productstudio gevestigd in Amsterdam. Wij bouwen AI, data en digitale producten voor ondernemers en organisaties. Vragen over dit beleid? Stuur een e-mail naar '
                : 'blablabuild is a product studio based in Amsterdam. We build AI, data and digital products for founders and organisations. Questions about this policy? Email us at '}
              <a href="mailto:team@blablabuild.com" className="text-bla-lime underline underline-offset-2">
                team@blablabuild.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-host text-lg font-medium text-white">
              {nl ? '2. Welke gegevens we verzamelen' : '2. What data we collect'}
            </h2>
            <p>
              {nl
                ? 'We verzamelen alleen gegevens die je actief met ons deelt — zoals je naam, e-mailadres en projectomschrijving wanneer je contact opneemt via ons formulier of de AI-advies tool. We slaan geen gevoelige persoonsgegevens op.'
                : 'We only collect data you actively share with us — such as your name, email address and project description when you reach out via our form or AI advice tool. We do not store sensitive personal data.'}
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-host text-lg font-medium text-white">
              {nl ? '3. Hoe we gegevens gebruiken' : '3. How we use data'}
            </h2>
            <p>
              {nl
                ? 'Jouw gegevens worden uitsluitend gebruikt om te reageren op jouw vraag of om een kennismakingsgesprek te plannen. We verkopen of verhuren geen gegevens aan derden.'
                : 'Your data is used solely to respond to your enquiry or to schedule an introductory call. We do not sell or rent data to third parties.'}
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-host text-lg font-medium text-white">
              {nl ? '4. Cookies en analytics' : '4. Cookies & analytics'}
            </h2>
            <p>
              {nl
                ? 'Wij gebruiken minimale analytics (geanonimiseerd) om te begrijpen hoe bezoekers onze site gebruiken. Er worden geen tracking-cookies geplaatst zonder jouw toestemming.'
                : 'We use minimal analytics (anonymised) to understand how visitors use our site. No tracking cookies are placed without your consent.'}
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-host text-lg font-medium text-white">
              {nl ? '5. Jouw rechten' : '5. Your rights'}
            </h2>
            <p>
              {nl
                ? 'Op grond van de AVG heb je het recht op inzage, correctie en verwijdering van jouw persoonsgegevens. Stuur een verzoek naar '
                : 'Under the GDPR you have the right to access, correct and delete your personal data. Send a request to '}
              <a href="mailto:team@blablabuild.com" className="text-bla-lime underline underline-offset-2">
                team@blablabuild.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
