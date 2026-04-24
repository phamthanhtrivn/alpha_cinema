import React from "react";
import { Container, Section } from "../../components/common/Layout";
import { useSelector } from "react-redux";

const Home: React.FC = () => {
  const auth = useSelector((state: any) => state.auth);

  console.log(auth);

  return (
    <div className="bg-white">
      {/* Hero Section - Full width color but container padding */}
      <Section className="bg-slate-50 py-24">
        <Container className="text-center">
          <span className="text-alpha-blue font-bold tracking-widest uppercase text-xs">
            Phim hot tuần này
          </span>
          <h1 className="text-5xl md:text-7xl font-black mt-4 mb-8 tracking-tighter text-slate-900 leading-tight">
            MUA VÉ XEM PHIM <br className="hidden md:block" /> TRỰC TUYẾN
          </h1>
          <div className="flex justify-center space-x-4">
            <button className="bg-alpha-blue text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-blue-100 hover:scale-105 transition-transform">
              XEM PHIM NGAY
            </button>
            <button className="border-2 border-slate-200 text-slate-800 px-10 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors">
              TÌM RẠP CHIẾU
            </button>
          </div>
        </Container>
      </Section>

      <Section className="py-20">
        <Container>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic">
                Phim đang chiếu
              </h2>
              <div className="h-1.5 w-24 bg-alpha-orange mt-2"></div>
            </div>
            <a
              href="#"
              className="text-slate-400 font-bold text-sm hover:text-alpha-blue uppercase tracking-widest"
            >
              Xem tất cả
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {[1, 2, 3, 4, 5].map((id) => (
              <div key={id} className="group cursor-pointer">
                <div className="aspect-[2/3] border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-center relative overflow-hidden shadow-sm shadow-slate-200 group-hover:shadow-2xl group-hover:-translate-y-3 transition-all duration-300">
                  <span className="text-slate-300 italic font-black text-2xl uppercase tracking-tighter opacity-20">
                    POSTER {id}
                  </span>
                  <div className="absolute inset-0 bg-alpha-blue/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                    <button className="bg-alpha-orange text-white px-6 py-2 rounded-full font-bold text-sm">
                      MUA VÉ
                    </button>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-black text-slate-800 truncate uppercase tracking-tight group-hover:text-alpha-blue transition-colors">
                    Movie Title {id}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
                    Phim hành động • 2D
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default Home;
