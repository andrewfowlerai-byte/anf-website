import { BookCallButton } from '../components/BookCallButton'

const values = [
  {
    title: 'Clarity',
    body: 'We believe clarity creates confidence. Clear communication and clear expectations help people move with purpose. We remove noise and confusion so every message, system, and routine feels simple and easy to follow.',
  },
  {
    title: 'Structure',
    body: 'Structure creates freedom. Strong systems reduce stress, support consistency, and make daily work easier to manage. We design routines that help people stay organized, focused, and in control of their time.',
  },
  {
    title: 'Integrity',
    body: 'We believe in honest guidance and meaningful support. We do not offer shortcuts or empty promises. Our work is built on trust, transparency, and a commitment to doing what is right for the long term.',
  },
  {
    title: 'Practicality',
    body: 'We value solutions that work in real life. Everything we create is simple, usable, and grounded in the way people actually operate. We focus on routines that make work feel lighter, not more complicated.',
  },
]

export function About() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">About</p>
        <h1 className="text-4xl md:text-6xl font-display text-silver-100 leading-tight">
          Built around your business.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-silver-400 max-w-2xl mx-auto leading-relaxed">
          Steady guidance through change. Simple systems that hold up. One partner, one roadmap, one team.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3 text-center">Meet the founder</p>
        <h2 className="text-3xl md:text-4xl font-display text-silver-100 mb-12 text-center">Andrew Fowler</h2>
        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-12 items-start max-w-5xl mx-auto">
          <div className="md:w-72 mx-auto md:mx-0">
            <img
              src="/founder.png"
              alt="Andrew Fowler, founder of ANF Consulting"
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl border border-midnight-700/40 shadow-lg"
            />
          </div>
          <div className="space-y-5 text-silver-300 leading-relaxed">
            <p>
              ANF Consulting was founded by Andrew Fowler, a systems-minded professional with years of experience working directly with modern tools and emerging technology. Andrew built this company after seeing how quickly the landscape was changing and how unprepared many professionals felt as new tools became part of everyday work.
            </p>
            <p>
              His background includes real estate, communication, and workflow design, but his strongest experience comes from years spent learning how these new tools actually behave in real situations. That hands-on work became the foundation for the education and consulting we provide today.
            </p>
            <p>
              Andrew brings a practical and steady approach to every project. He focuses on understanding how people think, how they work, and where they feel stuck. This perspective shapes the way ANF Consulting creates systems that feel natural, simple, and easy to maintain.
            </p>
            <p>
              As the founder, Andrew leads with clarity, integrity, and a commitment to helping people move through change with confidence. His work reflects a belief that modern tools should support human strengths, not replace them, and that every person deserves systems that make their work feel lighter and more intentional.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Our mission</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">What we exist to do</h2>
        </div>
        <div className="space-y-5 text-silver-300 text-lg leading-relaxed border-l-2 border-flame-500/60 pl-6 md:pl-8">
          <p>
            ANF Consulting exists to help people navigate a world where modern technology is no longer optional. The tools around us are changing quickly and they are becoming a permanent part of how work gets done. We believe this shift should feel empowering rather than overwhelming.
          </p>
          <p>
            Our mission is to guide professionals and small businesses through this transition with clarity, structure, and confidence. We help people understand how to use new tools in a way that protects their voice, strengthens their message, and supports the work they already do well.
          </p>
          <p>
            We focus on simple systems, clear communication, and routines that make everyday work easier. Our purpose is to help people move forward with confidence as the world continues to evolve.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Our values</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">What we believe</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="border border-midnight-700/30 hover:border-flame-500/40 rounded-2xl p-7 bg-midnight-900/40 transition-colors">
              <h3 className="text-xl font-display text-flame-400 mb-3">{v.title}</h3>
              <p className="text-silver-400 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Our story</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">How ANF came to be</h2>
        </div>
        <div className="space-y-5 text-silver-300 text-lg leading-relaxed">
          <p>
            ANF Consulting began inside the real estate world, where clear communication and strong systems are essential. Early in his real estate career, our founder, Andrew Fowler, saw how quickly modern tools were becoming part of everyday work. He realized that professionals who learned to use these tools with clarity and intention would have a real advantage, while those who avoided them would eventually fall behind.
          </p>
          <p>
            This understanding shaped the direction of ANF Consulting. Andrew spent years working directly with new technology, learning how it behaved in real situations, and discovering how it could support the work professionals were already doing. As he shared what he learned, more people began asking for guidance. That interest eventually led to an invitation to teach a Continuing Education course in Ohio, where he helped real estate agents understand how to bring structure and clarity to their communication and daily routines.
          </p>
          <p>
            From that experience, ANF Consulting grew into a company focused on helping people move through change with confidence. We saw that most professionals did not need more complexity. They needed calm guidance, simple systems, and a way to understand new tools without feeling overwhelmed.
          </p>
          <p>
            Today, ANF Consulting helps individuals and small businesses create routines that support growth, reduce friction, and make everyday work feel lighter. Our story continues to evolve, but our foundation remains the same. We believe in clarity. We believe in structure. We believe in honest support that helps people move forward with confidence as the world continues to change.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="rounded-3xl border border-flame-500/30 bg-midnight-900/60 overflow-hidden shadow-flame-glow">
          <div className="grid md:grid-cols-2 gap-0 items-stretch">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-4">Also building</p>
              <h2 className="text-4xl md:text-5xl font-display text-silver-100 mb-3 leading-tight">
                Everlee
              </h2>
              <p className="text-lg text-silver-200 leading-relaxed mb-4">
                A daily content and consistency app for real estate agents and small business owners.
              </p>
              <p className="text-silver-400 leading-relaxed mb-6">
                Everlee generates social media posts, blog content, and AI images tailored to your business, tracks your posting streak to keep you accountable, and stores all your media in one library. The idea is simple. Show up every day, let Everlee handle the content, build momentum over time.
              </p>
              <a
                href="https://useeverlee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-flame-500 hover:bg-flame-600 text-white font-medium px-6 py-3 rounded-md shadow-flame-glow hover:shadow-lg transition-all self-start"
              >
                Try Everlee
                <span aria-hidden>↗</span>
              </a>
            </div>
            <div className="bg-midnight-950/40 p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-midnight-700/30">
              <img
                src="/everlee-home.png"
                alt="Everlee app showing daily content, streak tracking, and posting checklist"
                loading="lazy"
                decoding="async"
                className="w-full max-w-[280px] md:max-w-xs"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-display text-silver-100 mb-4">Work with us</h2>
        <p className="text-lg text-silver-400 mb-8 max-w-2xl mx-auto">
          A 30-minute discovery call. No pitch, no pressure. Just a conversation about what you're trying to build.
        </p>
        <BookCallButton size="lg" />
      </section>
    </>
  )
}
