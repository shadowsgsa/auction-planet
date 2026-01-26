import {Link} from "react-router-dom";

const Cta = () => {
    return (
        <section className="py-5  text-white text-center" style={{ background: "#297bf7c3" }}>
            <div className="container">
                <h2 className=" fw-bold mb-3">Ready to Get Started?</h2>
                <p className="lead mb-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    Join Auction Planet today and discover amazing deals or turn your items into cash
                </p>

                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                    {/* <button
                        className="btn btn-light btn-lg text-primary">
                        Start Bidding Now
                    </button>
                    <button
                        className="btn btn-light btn-lg text-primary">
                        List Your First Item
                    </button> */}
                    <Link
                        to="/auctions"
                        className="btn btn-light btn-lg text-primary"
                    >
                        Start Bidding Now
                    </Link>

                    <Link
                        to="/sell-item"
                        className="btn btn-light btn-lg text-primary"
                    >
                        List Your First Item
                    </Link>
                </div>
            </div>
        </section>
    )
}
export default Cta;