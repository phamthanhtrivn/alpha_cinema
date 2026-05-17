import { useEffect } from "react";
import { BriefcaseBusiness, MapPin, Mail, BadgeCheck, Clock3, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";

const jobs = [
  {
    title: "Nhân viên bán vé",
    meta: "Ca linh hoạt · Giao tiếp tốt · Ưu tiên có kinh nghiệm dịch vụ",
    points: [
      "Tư vấn suất chiếu, hỗ trợ đặt vé và xử lý thanh toán tại quầy.",
      "Phối hợp với bộ phận vận hành để đảm bảo khách hàng lên phòng chiếu đúng giờ.",
    ],
  },
  {
    title: "Nhân viên chăm sóc khách hàng",
    meta: "Full-time/Part-time · Thân thiện · Giải quyết tình huống nhanh",
    points: [
      "Tiếp nhận phản hồi, hỗ trợ đổi vé, kiểm tra đơn và giải đáp thắc mắc.",
      "Phối hợp với các bộ phận liên quan để xử lý yêu cầu của khách hàng kịp thời.",
    ],
  },
  {
    title: "Nhân viên vận hành rạp",
    meta: "Ca xoay · Tỉ mỉ · Tinh thần trách nhiệm cao",
    points: [
      "Kiểm tra phòng chiếu, thiết bị, ánh sáng và khu vực sảnh trước giờ mở cửa.",
      "Đảm bảo trải nghiệm xem phim sạch sẽ, an toàn và đúng quy trình.",
    ],
  },
];

const perks = [
  "Môi trường làm việc trẻ, năng động và nhiều cơ hội học hỏi.",
  "Chế độ ca linh hoạt phù hợp sinh viên hoặc người muốn làm thêm.",
  "Đào tạo nghiệp vụ trước khi nhận ca chính thức.",
];

const Recruitment = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-slate-50 py-14">
      <Container>
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="overflow-hidden rounded-md border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
                <BriefcaseBusiness size={14} />
                Tuyển dụng
              </div>
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Gia nhập đội ngũ vận hành rạp của chúng tôi
                </h1>
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  Chúng tôi luôn tìm kiếm những người yêu điện ảnh, có tinh thần phục vụ
                  và muốn đồng hành cùng một hệ thống rạp hiện đại, chuyên nghiệp.
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.title} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">{job.title}</h2>
                    <p className="text-sm font-medium text-slate-500">{job.meta}</p>
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 flex-none rounded-md bg-alpha-orange" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-alpha-orange/10 p-3 text-alpha-orange">
                    <BadgeCheck size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Quyền lợi</h2>
                </div>
                <ul className="space-y-3 text-sm leading-6 text-slate-600">
                  {perks.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 flex-none rounded-md bg-alpha-blue" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-slate-950 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-slate-100">
                  <Sparkles size={14} />
                  Gửi hồ sơ
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  Hãy gửi CV hoặc thông tin liên hệ đến bộ phận nhân sự để chúng tôi có
                  thể sắp xếp phỏng vấn và trao đổi thêm về vị trí phù hợp.
                </p>
                <div className="space-y-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    hr@alphacinema.vn
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    Hệ thống rạp Alpha Cinema
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} />
                    8:30 - 17:30, Thứ 2 đến Thứ 6
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Recruitment;
