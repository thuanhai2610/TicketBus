import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SocialLoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/'); // Chuyển hướng về trang chính
    } else {
      navigate('/login', { state: { error: 'Không tìm thấy token. Vui lòng đăng nhập lại.' } });
    }
  }, [location, navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
};

export default SocialLoginSuccess;