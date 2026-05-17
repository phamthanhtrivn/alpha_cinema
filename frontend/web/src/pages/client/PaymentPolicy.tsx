import { useEffect } from "react";
import { BadgeDollarSign, CircleCheckBig, HandCoins, ReceiptText, ShieldCheck, Ticket } from "lucide-react";
import { Container } from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    icon: BadgeDollarSign,
    title: "Phương thức thanh toán",
    items: [
      "Thanh toán bằng ví điện tử, thẻ ngân hàng, chuyển khoản hoặc điểm tích lũy nếu chương trình áp dụng.",
      "Một số giao dịch có thể cần xác thực bổ sung để đảm bảo an toàn cho chủ tài khoản.",
      "Phí phát sinh từ ngân hàng hoặc cổng thanh toán, nếu có, sẽ được thông báo trước khi xác nhận.",
    ],
  },
  {
    icon: ReceiptText,
    title: "Xác nhận giao dịch",
    items: [
      "Đơn hàng chỉ được xem là hoàn tất khi hệ thống ghi nhận thanh toán thành công.",
      "Vé điện tử và biên nhận sẽ được gửi về tài khoản hoặc email/số điện thoại đã đăng ký.",
      "Khách hàng nên kiểm tra kỹ suất chiếu, số ghế và thông tin đơn trước khi thanh toán.",
    ],
  },
  {
    icon: Ticket,
    title: "Quy định đổi, hủy và hoàn tiền",
    items: [
      "Việc đổi/hủy vé phụ thuộc vào thời gian còn lại trước giờ chiếu và chính sách từng suất.",
      "Phí hoàn tiền hoặc phí xử lý giao dịch có thể được áp dụng nếu giao dịch đã đi qua cổng thanh toán.",
      "Các vé khuyến mãi, combo ưu đãi hoặc đơn đã sử dụng một phần có thể không được hoàn theo quy định.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "An toàn thanh toán",
    items: [
      "Dữ liệu thanh toán được truyền qua kênh bảo mật và xử lý bởi đối tác thanh toán uy tín.",
      "Rạp không yêu cầu khách hàng cung cấp mã OTP, mật khẩu ví hoặc thông tin thẻ đầy đủ qua tin nhắn.",
      "Nếu phát hiện giao dịch bất thường, khách hàng cần liên hệ hỗ trợ ngay để kiểm tra trạng thái đơn hàng.",
    ],
  },
];

const paymentNotes = [
  {
    icon: HandCoins,
    title: "Đối soát và thời gian xử lý",
    description:
      "Một số giao dịch có thể cần thời gian đối soát từ vài phút đến vài giờ tùy phương thức thanh toán và hệ thống trung gian.",
  },
  {
    icon: CircleCheckBig,
    title: "Điều kiện áp dụng",
    description:
      "Chính sách thanh toán áp dụng cho đặt vé xem phim, combo tại quầy và các dịch vụ liên quan được công bố trên hệ thống.",
  },
];

const PaymentPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-slate-50 py-14">
      <Container>
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="relative overflow-hidden rounded-md border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,0.08),transparent_40%),linear-gradient(315deg,rgba(14,165,233,0.08),transparent_45%)]" />
            <div className="relative flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
                <BadgeDollarSign size={14} />
                Chính sách thanh toán
              </div>
              <div className="space-y-3 max-w-3xl">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Minh bạch, an toàn và phù hợp với trải nghiệm mua vé tại rạp
                </h1>
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  Trang này mô tả cách chúng tôi xử lý thanh toán, xác nhận đơn hàng,
                  đổi hủy và hoàn tiền để khách hàng nắm rõ trước khi đặt vé hoặc mua
                  dịch vụ tại rạp.
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            {paymentNotes.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="flex h-full gap-4 p-6">
                  <div className="rounded-md bg-alpha-orange/10 p-3 text-alpha-orange">
                    <Icon size={20} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-black text-slate-900">{title}</h2>
                    <p className="text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {sections.map(({ icon: Icon, title, items }) => (
              <Card key={title} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-sm bg-slate-950 p-3 text-white">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    {items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 flex-none rounded-md bg-alpha-blue" />
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
              <h2 className="text-2xl font-black">Một vài lưu ý quan trọng</h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-300">
                Khách hàng cần sử dụng thông tin thanh toán chính chủ, kiểm tra kỹ
                nội dung đơn trước khi xác nhận và lưu lại biên nhận để đối chiếu khi
                cần hỗ trợ. Các trường hợp hoàn tiền hoặc xử lý ngoại lệ sẽ được xem
                xét theo quy định hiện hành của rạp và đối tác thanh toán.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default PaymentPolicy;
