const apkUrl = process.env.NEXT_PUBLIC_APK_URL;

function Icon({ name, size = 20 }: { name: "arrow" | "pin" | "shoe" | "chat" | "check" | "spark"; size?: number }) {
  const paths = {
    arrow: <><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    shoe: <><path d="M3 17.5c0-1.5 1-2.5 2.5-2.5h3l1.5-5 3 3.5 4.5 1.5 3.5.5c1 0 2 1 2 2.5V20H3z"/><path d="M8 20h13M12 15l2-2M15 16l2-2"/></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8.2 8.2 0 0 1-3-.6L4 20l1.6-5.5a8.2 8.2 0 0 1-.6-3A7.5 7.5 0 0 1 12.5 4 7.5 7.5 0 0 1 20 11.5Z"/><path d="M8 11.5h9"/></>,
    check: <path d="m4 12 5 5L20 6"/>,
    spark: <><path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function DownloadButton({ className = "" }: { className?: string }) {
  return apkUrl ? <a className={`button ${className}`} href={apkUrl} download>Download for Android <Icon name="arrow" size={18}/></a>
    : <a className={`button ${className}`} href="#how-it-works">See how it works <Icon name="arrow" size={18}/></a>;
}

export default function Home() {
  return <main>
    <header className="nav wrap">
      <a href="#top" className="brand" aria-label="RunSide home"><span className="brand-mark">R<span>.</span></span><span>runside</span></a>
      <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#why-runside">Why RunSide</a><a href="#download">Get the app</a></nav>
      <a className="nav-cta" href="#download">Get moving <Icon name="arrow" size={16}/></a>
    </header>

    <section id="top" className="hero wrap">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot"/> THE RUN IS BETTER TOGETHER</div>
        <h1>Find your pace.<br/><em>Find your people.</em></h1>
        <p className="hero-lede">That run you keep putting off? There&apos;s someone nearby who wants to do it with you. Make a plan, find your match, and show up for each other.</p>
        <div className="hero-actions"><DownloadButton/><a className="text-link" href="#how-it-works">Explore how it works <span>↗</span></a></div>
        <div className="hero-note"><span className="avatars"><i>A</i><i>K</i><i>M</i></span><span>Made for the days you need<br/>a reason to lace up.</span></div>
      </div>
      <div className="hero-art" aria-label="Preview of the RunSide app">
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <div className="floating-badge badge-left"><span className="badge-icon"><Icon name="shoe" size={19}/></span><div><strong>Easy 5K</strong><small>Tomorrow · 7:00 AM</small></div></div>
        <div className="phone">
          <div className="phone-top"><span>9:41</span><span>●●● ▰</span></div>
          <div className="phone-content"><div className="app-top"><div><small>GOOD MORNING, ALEX</small><h3>Let&apos;s go run.</h3></div><div className="app-avatar">A</div></div>
            <div className="map-preview"><div className="map-road road-one"/><div className="map-road road-two"/><div className="map-road road-three"/><div className="map-road road-four"/><div className="map-park"/><div className="map-label label-one">KARURA FOREST</div><div className="map-label label-two">PARKLANDS</div><div className="map-pin pin-one">↗</div><div className="map-pin pin-two">↗</div><div className="map-pin pin-three">↗</div></div>
            <div className="app-list-head"><strong>Runs near you</strong><span>See all →</span></div>
            <div className="app-run-card"><div className="card-head"><span className="pill">OPEN RUN</span><span>2.4 km away</span></div><strong>Morning miles in Karura</strong><div className="run-meta"><span>◷  Tomorrow, 7:00 AM</span><span>↗  5 km · 6:00 /km</span></div><div className="runner"><span className="runner-avatar">J</span> Hosted by Jamie <span className="join">Join run →</span></div></div>
            <div className="app-bottom"><span>⌖<small>Discover</small></span><span>＋<small>Plan</small></span><span>◌<small>My runs</small></span><span>♙<small>Profile</small></span></div>
          </div>
        </div>
        <div className="floating-badge badge-right"><span className="badge-icon orange"><Icon name="check" size={18}/></span><div><strong>You&apos;re matched!</strong><small>A good run starts here.</small></div></div>
        <div className="hero-scribble">good things<br/>happen outside <span>↗</span></div>
      </div>
    </section>

    <section className="ticker" aria-label="App benefits"><div>YOUR PACE <span>✳</span> YOUR PEOPLE <span>✳</span> YOUR NEXT RUN <span>✳</span> YOUR PACE <span>✳</span> YOUR PEOPLE <span>✳</span> YOUR NEXT RUN <span>✳</span></div></section>

    <section id="how-it-works" className="steps section wrap"><div className="section-intro"><span className="section-kicker">01 / HOW IT WORKS</span><h2>From “maybe later”<br/>to <em>“see you there.”</em></h2><p>Everything you need to turn a solo intention into a shared plan.</p></div><div className="step-grid">
      <article className="step"><span className="step-number">01</span><div className="step-icon"><Icon name="pin" size={27}/></div><h3>Find a run nearby</h3><p>Explore planned runs around you. See the distance, pace and meeting area before you join.</p></article>
      <article className="step"><span className="step-number">02</span><div className="step-icon"><Icon name="shoe" size={27}/></div><h3>Make your move</h3><p>Request to join a run that feels right, or put your own plan out there and let someone find you.</p></article>
      <article className="step"><span className="step-number">03</span><div className="step-icon"><Icon name="chat" size={27}/></div><h3>Meet and move</h3><p>Once you match, chat to coordinate the details. Then get outside and make the run happen.</p></article>
    </div></section>

    <section id="why-runside" className="story"><div className="wrap story-inner"><div className="story-visual"><div className="story-circle"><span>5<span>km</span></span><small>ONE RUN CAN CHANGE YOUR DAY</small></div><div className="story-stamp">BETTER<br/>TOGETHER <span>✳</span></div></div><div className="story-copy"><span className="section-kicker">02 / THE IDEA</span><h2>More than<br/>a running app.</h2><p>Big groups aren&apos;t for everyone. RunSide makes space for a different kind of connection: one person, one shared goal, one good conversation along the way.</p><p>Whether you&apos;re chasing a faster split or just need a little push to get out the door, finding someone at your pace changes everything.</p><div className="story-quote">“The run is the reason.<br/>The connection is the magic.”</div></div></div></section>

    <section id="download" className="download section wrap"><div className="download-decoration">↗</div><span className="section-kicker">03 / YOUR NEXT STEP</span><h2>Go further.<br/><em>Go together.</em></h2><p>Your next running partner could be a few streets away. Start with one run.</p><DownloadButton className="button-light"/><small>{apkUrl ? "Android APK · Free to download" : "Android launch coming soon"}</small></section>

    <footer className="footer wrap"><a href="#top" className="brand"><span className="brand-mark">R<span>.</span></span><span>runside</span></a><span>Better runs, better company. Made for runners everywhere.</span><a href="mailto:hello@runside.app">Say hello ↗</a></footer>
  </main>;
}
