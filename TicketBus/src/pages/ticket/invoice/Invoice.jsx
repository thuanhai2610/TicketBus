
import React, { useRef } from 'react'
import bgImage from "../../../assets/bgimg.png";
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import PassengerInvoice from './passengerinvoice/PassengerInvoice';
import CompanyInvoice from './company/CompanyInvoice';

import { toPng } from 'html-to-image';
import download from 'downloadjs';

const Invoice = () => {

    const inVoiceRef = useRef(null);

    const handleDownload = async () => {
        if (inVoiceRef.current === null) return;

        try {
            const dataUrl = await toPng(inVoiceRef.current);

            //download imgae
            download(dataUrl, "nhismdKhoaHaiz.png")
        } catch (error) {
            console.error("Error while downloading the invoice", error);
        }
    }

    return (
        <div>
            {/* Top Layout */}
            <TopLayout
                bgImg={bgImage}
                title={'Collect your invoice '}
            />

            <RootLayout className="space-y-12 w-full pb-16 py-8">
                <div className="w-full flex items-center justify-center">

                    {/* invoice card */}
                    <div
                        ref={inVoiceRef}
                        className="w-[90%] grid grid-cols-5 bg-white rounded-3xl border border-neutral-200 shadow-sm relative "
                    >
                        {/* Left side passenger */}
                        <PassengerInvoice />
                        {/* Right side company */}
                        <CompanyInvoice />

                        {/* Cut circle */}
                        <div className="absolute -top-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
                        <div className="absolute -bottom-3 right-[18.8%] h-6 w-6 rounded-full bg-neutral-50" />
                    </div>


                </div>

                {/* Download invoice card button */}
                <div className="w-full flex justify-center items-center">
                    <button onClick={handleDownload} className="w-fit px-6 py-3 bg-primary text-neutral-50 font-bold text-lg rounded-lg">
                        Download Ticket
                    </button>
                </div>
            </RootLayout>

        </div>
    )
}

export default Invoice
