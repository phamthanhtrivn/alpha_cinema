import { useEffect } from "react";
import { Award, Globe2, HeartHandshake, Popcorn, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Suất chiếu mỗi ngày", value: "100+" },
  { label: "Khách hàng phục vụ", value: "Hàng triệu" },
  { label: "Không gian rạp", value: "Hiện đại" },
];

const values = [
  {
    icon: Sparkles,
    title: "Trải nghiệm tốt hơn mỗi ngày",
    description:
      "Chúng tôi tập trung vào sự tiện lợi khi đặt vé, chất lượng hình ảnh âm thanh và quy trình phục vụ rõ ràng.",
  },
  {
    icon: HeartHandshake,
    title: "Lấy khách hàng làm trung tâm",
    description:
      "Mọi cải tiến đều hướng đến việc giúp khách hàng xem phim thoải mái, nhanh chóng và an tâm hơn.",
  },
  {
    icon: Globe2,
    title: "Mở rộng kết nối điện ảnh",
    description:
      "Rạp hợp tác với nhà phát hành, đối tác thanh toán và thương hiệu giải trí để mang nội dung phong phú hơn đến khán giả.",
  },
];

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-slate-50 py-14">
      <Container>
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="relative overflow-hidden rounded-md border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)] sm:px-10 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_35%)]" />
            <div className="relative flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-slate-200">
                <Popcorn size={14} />
                Về chúng tôi
              </div>
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Hệ thống rạp chiếu phim mang đến trải nghiệm giải trí trọn vẹn
                </h1>
                <p className="text-sm leading-7 text-slate-300 sm:text-base">
                  Chúng tôi xây dựng một không gian điện ảnh hiện đại, thuận tiện và
                  thân thiện để mỗi buổi xem phim đều trở thành một trải nghiệm đáng nhớ.
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((item) => (
              <Card key={item.label} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-2 p-6 text-center">
                  <div className="text-3xl font-black text-slate-950">{item.value}</div>
                  <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-alpha-orange/10 p-3 text-alpha-orange">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
                  <Award size={14} />
                  Sứ mệnh
                </div>
                <p className="text-sm leading-7 text-slate-600">
                  Mang điện ảnh đến gần hơn với khán giả bằng hệ thống đặt vé tiện lợi,
                  dịch vụ ổn định và môi trường xem phim văn minh, an toàn.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
                  <Users size={14} />
                  Đội ngũ vận hành
                </div>
                <p className="text-sm leading-7 text-slate-600">
                  Các bộ phận bán vé, chăm sóc khách hàng, vận hành phòng chiếu và kỹ
                  thuật phối hợp chặt chẽ để đảm bảo chất lượng phục vụ đồng nhất.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default AboutUs;
