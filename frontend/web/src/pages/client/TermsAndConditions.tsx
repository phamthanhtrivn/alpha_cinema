import { useEffect } from "react";
import { CalendarRange, Ticket, ShieldCheck, Film, AlertTriangle } from "lucide-react";
import { Container } from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    icon: Ticket,
    title: "Phạm vi áp dụng",
    items: [
      "Điều khoản này áp dụng cho website, ứng dụng và các kênh bán vé chính thức của rạp.",
      "Khi đặt vé, mua combo hoặc sử dụng dịch vụ, khách hàng được xem là đã đồng ý với các điều khoản hiện hành.",
      "Rạp có thể cập nhật nội dung điều khoản để phù hợp với vận hành, pháp luật và chính sách đối tác.",
    ],
  },
  {
    icon: Film,
    title: "Đặt vé và giữ chỗ",
    items: [
      "Khách hàng cần kiểm tra kỹ phim, suất chiếu, ghế ngồi và thông tin người nhận trước khi xác nhận.",
      "Một số đơn hàng có thể được giữ chỗ tạm thời trong thời gian giới hạn trước khi thanh toán hoàn tất.",
      "Rạp có quyền hủy giao dịch nếu phát hiện sai thông tin, gian lận hoặc vi phạm quy trình đặt vé.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Quy định sử dụng tại rạp",
    items: [
      "Khách hàng vui lòng đến sớm để làm thủ tục và hạn chế gây ảnh hưởng đến khách khác trong suất chiếu.",
      "Không mang vật dụng cấm, hành vi gây rối hoặc ghi hình trái phép trong phòng chiếu.",
      "Rạp có thể từ chối phục vụ nếu khách hàng vi phạm nội quy an toàn, an ninh hoặc thuần phong mỹ tục.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Miễn trừ và giới hạn trách nhiệm",
    items: [
      "Rạp không chịu trách nhiệm với sự cố phát sinh từ thiết bị, mạng internet hoặc thông tin do khách hàng cung cấp sai.",
      "Lịch chiếu, giá vé, khuyến mãi và sơ đồ ghế có thể thay đổi theo thực tế vận hành hoặc từ phía nhà phát hành.",
      "Trong trường hợp bất khả kháng, rạp sẽ cố gắng thông báo sớm và đưa ra phương án hỗ trợ phù hợp.",
    ],
  },
];

const TermsAndConditions = () => {
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
                <CalendarRange size={14} />
                Điều khoản chung
              </div>
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Quy định sử dụng dịch vụ và đặt vé tại rạp
                </h1>
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  Trang này tóm tắt những nguyên tắc cơ bản khi bạn đặt vé, thanh toán,
                  nhận dịch vụ và sử dụng không gian của rạp chiếu phim.
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {sections.map(({ icon: Icon, title, items }) => (
              <Card key={title} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-slate-950 p-3 text-white">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    {items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 flex-none rounded-md bg-alpha-orange" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-slate-950 text-white shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
            <CardContent className="space-y-4 p-6 sm:p-8">
              <h2 className="text-2xl font-black">Cập nhật điều khoản</h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                Rạp có thể chỉnh sửa nội dung điều khoản khi có thay đổi về vận hành,
                luật áp dụng hoặc dịch vụ mới. Phiên bản cập nhật sẽ có hiệu lực kể từ
                thời điểm được công bố trên hệ thống.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default TermsAndConditions;
