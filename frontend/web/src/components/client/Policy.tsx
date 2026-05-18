const Policy = () => {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img
          src="https://res.cloudinary.com/dcwauocnz/image/upload/v1778670717/quyenloitv-lcd-headline_1673941902410_o1dcwo.png"
          alt="Membership Policy"
          className="w-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
        {/* Title */}
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-2xl font-bold text-slate-800">
            Thể lệ chương trình thành viên
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Chương trình khách hàng thân thiết Alpha Cinema là chương trình ưu
            đãi dành cho các thành viên với hệ thống tích điểm và nâng hạng
            thành viên theo tổng chi tiêu hằng năm.
          </p>
        </div>

        {/* Ranking */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-800">
            Hệ thống tích điểm thành viên
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img
              src="https://res.cloudinary.com/dcwauocnz/image/upload/v1778670717/thanh-tinh-diem_1576655615185_jjhzwg.jpg"
              alt="Tích điểm thành viên"
              className="w-full object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-lg font-bold text-sky-600">Member</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tích lũy ở mức{" "}
                <span className="font-semibold text-slate-800">3%</span> trên
                tổng giá trị giao dịch.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-lg font-bold text-amber-500">Silver</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tích lũy ở mức{" "}
                <span className="font-semibold text-slate-800">5%</span> trên
                tổng giá trị giao dịch.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-lg font-bold text-rose-500">Gold</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tích lũy ở mức{" "}
                <span className="font-semibold text-slate-800">7%</span> trên
                tổng giá trị giao dịch.
              </p>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5">
          <h3 className="text-base font-bold text-sky-700 mb-3">
            Ví dụ tích điểm
          </h3>

          <p className="text-sm text-slate-700 leading-relaxed">
            Khách hàng hạng <span className="font-semibold">Member</span> khi phát
            sinh giao dịch <span className="font-semibold">200.000 VNĐ</span> sẽ
            được tích <span className="font-semibold">3%</span> tương đương{" "}
            <span className="font-semibold">6 Stars</span>.
          </p>
        </div>

        {/* Rounding */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">
            Quy tắc làm tròn điểm
          </h3>

          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
              <p>
                Từ <span className="font-semibold">0.1 đến 0.4</span>: làm tròn
                xuống.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
              <p>
                Từ <span className="font-semibold">0.5 đến 0.9</span>: làm tròn
                lên.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
              <p>
                1 Star tương đương{" "}
                <span className="font-semibold">1.000 VNĐ</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Membership Level */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-800">
            Cấp độ thành viên
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-bold text-sky-600 text-lg">Member</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Tổng chi tiêu trong năm dưới{" "}
                <span className="font-semibold">2.000.000 VNĐ</span>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-bold text-amber-500 text-lg">Silver</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Tổng chi tiêu từ{" "}
                <span className="font-semibold">2.000.000 - 3.999.999 VNĐ</span>
                .
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="font-bold text-rose-500 text-lg">Gold</p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Tổng chi tiêu từ{" "}
                <span className="font-semibold">4.000.000 VNĐ</span> trở lên.
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Lưu ý</h3>

          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
              <p>
                Email và số điện thoại phải hợp lệ để duy trì tài khoản thành
                viên.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
              <p>Điểm tích lũy không có giá trị quy đổi thành tiền mặt.</p>
            </div>

            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
              <p>
                Điểm tích lũy có thời hạn sử dụng trong vòng{" "}
                <span className="font-semibold">01 năm</span>.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
              <p>Điểm có thể sử dụng tại tất cả các cụm rạp trên toàn quốc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policy;
