import React from 'react'
import bgImage from "../../../assets/bgimg.png";
import RootLayout from '../../../layout/RootLayout';
import TopLayout from '../../../layout/toppage/TopLayout';
import WarningAlert from '../../../components/alertmessage/WarningAlert';
import { Link } from 'react-router-dom';
import BusSeat from './seat/busseat/BusSeat';
import ToggleBtn from '../../../components/togglebtn/ToggleBtn';
import Amenites from './amenites/Amenites';

const Detail = () => {
  
  const message =(
      <>
        Mỗi khách hàng chỉ có thể đặt 10 chỗ ngồi. Nếu bạn muốn đặt nhiều hơn 10 chỗ,
        Vui lòng! liên hệ với<Link to={"/bus-tickets/support"} className='text-yellow-700 font-medium'> nhóm hỗ trợ của chúng tôi.</Link>
      </>
  );
  return (
    <div className='w-full space-y-12 pb-16'>
      {/* Top Layout */}
      <TopLayout
        bgImg={bgImage}
        title={'Bus Detail'}
      />

      <RootLayout className="space-y-12 w-full pb-16">

        {/* Seat Layout and seclection action detail */}
        <div className="w-full space-y-8">
          
          {/* Warning Message */}
            <WarningAlert  message={message}/>
           
            <BusSeat />

        </div>
        {/* Bus Detail */}
          <div className="w-full flex items-center justify-center flex-col gap-8 text-center">
              {/* description about the bus */}
                <p className="text-base text-neutral-500 font-normal text-justify  dark:text-neutral-300">
                  This is just a sample text for the demo purpose
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                   Quo quis optio id illo animi? Vel quod laborum illo tempora placeat omnis eius, minima,
                   impedit repellendus eos provident asperiores, et dolorem?
                   impedit repellendus eos provident asperiores, et dolorem?
                  Eveniet, nisi laudantium tenetur facilis ab harum saepe deleniti nobis! 
                   Eveniet, nisi laudantium tenetur facilis ab harum saepe deleniti nobis! 
                   impedit repellendus eos provident asperiores, et dolorem?
                   impedit repellendus eos provident asperiores, et dolorem?
              
                  <span className="text-lg text-neutral-600 font-medium ml-2  dark:text-neutral-50">
                    Want to see more about the bus?
                  </span>
                </p>

              {/* Button */}
              <div className="w-full flex items-center justify-center gap-6 flex-col">
                  <ToggleBtn
                    buttonText={"See Bus Detail"}
                    buttonTextHidden={"Hide Bus Detail"}
                  >
                    <div className="w-full space-y-10">

                      {/* Policy and amenites */}
                      <div className="w-full grid grid-cols-7 gap-20">

                        {/* Amenites */}
                        <Amenites />

                        {/*Policy */}
                      </div>

                      {/* Bus images */}
                    </div>

                  </ToggleBtn>
              </div>
          </div>
      
      </RootLayout>
    </div>
  )
}

export default Detail
