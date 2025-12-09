"use client"

export function DashboardFooter() {
    return (
        <footer style={{
            marginTop: '6rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '4rem',
            paddingBottom: '2rem',
            color: 'var(--text-secondary)'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '3rem',
                maxWidth: '1280px',
                margin: '0 auto',
                marginBottom: '4rem'
            }}>
                {/* Brand Column */}
                <div style={{ gridColumn: 'span 2' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '1rem',
                        fontFamily: 'var(--font-family-heading)'
                    }}>
                        Cubane.
                    </h2>
                    <p style={{
                        maxWidth: '300px',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem',
                        fontSize: '0.95rem'
                    }}>
                        We are your personal guide for exploring web3 projects & earning 100x rewards
                    </p>
                </div>

                {/* Links Columns */}
                <div className="footer-links">
                    <h4>CUBANE</h4>
                    <a href="#">Explore Quests</a>
                    <a href="#">Communities</a>
                    <a href="#">Alpha Hub</a>
                </div>

                <div className="footer-links">
                    <h4>EARN</h4>
                    <a href="#">Refer & Earn</a>
                    <a href="#">Leaderboard</a>
                    <a href="#">Achievements</a>
                </div>

                <div className="footer-links">
                    <h4>ABOUT</h4>
                    <a href="#">Product Roadmap</a>
                    <a href="#">Affiliate Program</a>
                    <a href="#">Sign up Program</a>
                    <a href="#">Growth Community</a>
                    <a href="#">Blogs</a>
                </div>

                <div className="footer-links">
                    <h4>SUPPORT</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Create your quest</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Community Guidelines</a>
                </div>
            </div>

            <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '2rem',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--text-tertiary)'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <p style={{ marginBottom: '1rem', textAlign: 'justify' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Disclaimer:</strong> Crypto Products, Virtual Digital Assets, and NFTs are unregulated and can be highly risky. There may be no regulatory recourse for any loss from such transactions. We advise the viewer to proceed with caution. Nothing in this website or any communication published by us amounts to, is intended to be, or should be construed as investment or purchase advice of any kind or financial advice or promotion under any applicable laws. Any decision made based on the content provided on this website or any communication published by us shall not be attributable to us.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Created by Cubane</span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {/* Social Icons could go here */}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .footer-links {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .footer-links h4 {
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .footer-links a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.2s;
            font-size: 0.95rem;
        }
        .footer-links a:hover {
            color: #fff;
        }
        @media (max-width: 768px) {
            .footer-links {
                min-width: 140px;
            }
        }
      `}</style>
        </footer>
    )
}
