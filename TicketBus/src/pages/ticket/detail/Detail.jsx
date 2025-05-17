import React, { useState, useEffect } from 'react';
import bgImage from '../../../assets/bgimg.png';
import RootLayout from '../../../layout/RootLayout';
import TopLayout from '../../../layout/toppage/TopLayout';
import WarningAlert from '../../../components/alertmessage/WarningAlert';
import { Link } from 'react-router-dom';
import BusSeat from './seat/busseat/BusSeat';
import ToggleBtn from '../../../components/togglebtn/ToggleBtn';


const Detail = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const message = (
    <>
      Mỗi khách hàng chỉ có thể đặt 10 chỗ ngồi. Nếu bạn muốn đặt nhiều hơn 10 chỗ,
      Vui lòng! liên hệ với{' '}
      <Link to={'/bus-tickets/support'} className='text-yellow-700 font-medium'>
        nhóm hỗ trợ của chúng tôi.
      </Link>
    </>
  );

  // Policy Component
  const Policy = ({ isMobile }) => {
    if (isMobile) {
      // Phiên bản cho mobile
      return (
        <div className="w-full space-y-3 ">
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-700">
            Chính sách đặt vé xe khách
          </h3>
          <ul className="text-sm text-neutral-500 dark:text-neutral-500 list-disc pl-5 space-y-2">
            <li>Đặt vé ít nhất 2 giờ trước giờ khởi hành.</li>
            <li>Hủy vé trước 24 giờ: hoàn 80%.</li>
            <li>Hủy trong 24 giờ: không hoàn tiền.</li>
            <li>Liên hệ hỗ trợ nếu cần đổi thông tin vé.</li>
            <li>Trẻ em dưới 6 tuổi được miễn phí nếu ngồi cùng ghế với người lớn.</li>
          </ul>
          <p className="text-xs text-red-700 italic dark:text-red-400">
            <span className="text-red-700">*</span> Lưu ý: Chính sách có thể được thay đổi. Vui lòng kiểm tra trước khi đặt vé.
          </p>
        </div>

      );
    }

    // Phiên bản cho desktop
    return (
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-700 mb-4">
          Chính sách đặt vé xe khách
        </h2>
        <ul className="text-base text-neutral-600 dark:text-neutral-500 list-disc pl-6 space-y-2 mb-4">
          <li>Đặt vé ít nhất 2 giờ trước giờ khởi hành để đảm bảo chỗ ngồi.</li>
          <li>Hủy vé trước 24 giờ: hoàn 80% giá vé.</li>
          <li>Hủy vé trong vòng 24 giờ: không hoàn tiền.</li>
          <li>Thay đổi thông tin vé: liên hệ bộ phận hỗ trợ trước 12 giờ trước khi khởi hành.</li>
          <li>Trẻ em dưới 6 tuổi được miễn phí nếu ngồi cùng ghế với người lớn.</li>
        </ul>
        <p className="text-sm text-red-700 italic dark:text-red-400 ">
          *Lưu ý: Chính sách có thể được thay đổi. Vui lòng kiểm tra trước khi đặt vé.
        </p>
      </div>
    );

  };



  // Desktop Layout
  const DesktopDetail = (
    <div className="w-full space-y-12 pb-16 bg-white dark:bg-primary">
      {/* Top Layout */}
      <TopLayout bgImg={bgImage} title={'Chi tiết xe khách'} />

      <RootLayout className="space-y-12 w-full pb-16">
        {/* Seat Layout and Selection Action Detail */}
        <div className="w-full space-y-8">
          {/* Warning Message */}
          <WarningAlert message={message} />
          <BusSeat />
        </div>

        {/* Bus Detail */}
        <div className="w-full flex items-center justify-center flex-col gap-8 text-center">
          {/* Description about the bus */}
          <p className="text-base text-neutral-500 font-normal text-justify dark:text-neutral-300 w-full">
            Đặt vé xe khách dễ dàng và linh hoạt với chính sách rõ ràng, minh bạch. Chúng tôi hỗ trợ hủy và thay đổi thông tin vé theo thời gian quy định,
            đảm bảo quyền lợi tối đa cho hành khách. Bên cạnh đó, bạn sẽ được trải nghiệm hành trình thoải mái với ghế giường nằm hiện đại,
            Wi-Fi miễn phí và đội ngũ tài xế chuyên nghiệp.
            <span className="text-lg text-neutral-600 font-medium ml-2 dark:text-neutral-50">
              Xem chi tiết chính sách đặt vé bên dưới.
            </span>
          </p>


          {/* Button */}
          <div className="w-full flex flex-col items-start justify-start gap-6">
            <ToggleBtn buttonText={'Xem chi tiết Chính sách'} buttonTextHidden={'Ẩn chi tiết Chính Sách'}>
              <div className="w-full space-y-6">
                {/* Policy */}
                <div className="w-full text-start">
                  <Policy isMobile={false} />
                </div>
              </div>
            </ToggleBtn>
          </div>


        </div>
      </RootLayout>
    </div>
  );

  // Mobile Layout
  const MobileDetail = (
    <div className="w-full space-y-8 pb-12 bg-white dark:bg-primary px-4">
      {/* Top Layout */}
      <TopLayout bgImg={bgImage} title={'Chi tiết xe khách'} />

      <RootLayout className="space-y-8 w-full pb-12">
        {/* Seat Layout and Selection Action Detail */}
        <div className="w-full space-y-6">
          {/* Warning Message */}
          <WarningAlert message={message} />
          <BusSeat />
        </div>

        {/* Bus Detail */}
        <div className="w-full flex flex-col items-center justify-center gap-6 text-center">
          {/* Description about the bus */}
          <p className="text-base text-neutral-500 font-normal text-justify dark:text-neutral-300 max-w-4xl">
            Đặt vé xe khách dễ dàng và linh hoạt với chính sách rõ ràng, minh bạch. Chúng tôi hỗ trợ hủy và thay đổi thông tin vé theo thời gian quy định,
            đảm bảo quyền lợi tối đa cho hành khách. Bên cạnh đó, bạn sẽ được trải nghiệm hành trình thoải mái với ghế giường nằm hiện đại,
            Wi-Fi miễn phí và đội ngũ tài xế chuyên nghiệp.
            <span className="text-lg text-neutral-600 font-medium ml-2 dark:text-neutral-50">
              Xem chi tiết chính sách đặt vé bên dưới.
            </span>
          </p>
          {/* Button */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <ToggleBtn buttonText="Xem chi tiết Chính sách" buttonTextHidden="Ẩn chi tiết Chính sách">
              <div className="w-full space-y-8">
                {/* Amenities and Policy */}
                <div className="w-full flex flex-col gap-6 text-start">
                  {/* Amenities */}
                  {/* Policy */}
                  <Policy isMobile={true} />
                </div>
                {/* Bus Images (add if needed) */}
              </div>
            </ToggleBtn>
          </div>
        </div>
      </RootLayout>
    </div>
  );

  return isMobile ? MobileDetail : DesktopDetail;
};

export default Detail;