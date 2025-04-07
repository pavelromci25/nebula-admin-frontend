import { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface App {
  id: string;
  type: 'game' | 'app';
  name: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  additionalCategories: string[];
  icon: string;
  gallery: string[];
  video?: string;
  developerId: string;
  platforms: string[];
  ageRating: string;
  inAppPurchases: boolean;
  supportsTON: boolean;
  supportsTelegramStars: boolean;
  contactInfo: string;
  status: 'added' | 'onModeration' | 'rejected';
  rejectionReason?: string;
}

interface Stat {
  totalApps: number;
  totalClicks: number;
  totalStars: number;
  totalComplaints: number;
}

const AdminDashboard: React.FC = () => {
  const { userId, isTelegram } = useTelegram();
  const [apps, setApps] = useState<App[]>([]);
  const [stats, setStats] = useState<Stat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  console.log('AdminDashboard: userId=', userId, 'isTelegram=', isTelegram);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        console.log('Fetching apps for moderation with userId:', userId);
        const response = await fetch(`https://nebula-server-ypun.onrender.com/api/admin/apps?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error || 'Неизвестная ошибка'}`);
        }
        const data = await response.json();
        console.log('Apps data:', data);
        setApps(data);
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке приложений:', error);
        setError('Не удалось загрузить приложения. Попробуйте позже.');
      }
    };

    if (isTelegram && userId && userId !== 'guest') {
      fetchApps();
    } else {
      console.log('Not fetching apps: isTelegram=', isTelegram, 'userId=', userId);
    }
  }, [userId, isTelegram]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching catalog stats with userId:', userId);
        const response = await fetch(`https://nebula-server-ypun.onrender.com/api/admin/stats?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error || 'Неизвестная ошибка'}`);
        }
        const data = await response.json();
        console.log('Stats data:', data);
        setStats(data);
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      }
    };

    if (isTelegram && userId && userId !== 'guest') {
      fetchStats();
    } else {
      console.log('Not fetching stats: isTelegram=', isTelegram, 'userId=', userId);
    }
  }, [userId, isTelegram]);

  const handleApprove = async (appId: string) => {
    try {
      console.log('Approving app with userId:', userId);
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/admin/apps/${appId}/approve?userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error || 'Неизвестная ошибка'}`);
      }
      setApps(apps.map(app => app.id === appId ? { ...app, status: 'added', rejectionReason: undefined } : app));
      alert('Приложение успешно подтверждено!');
    } catch (error) {
      console.error('Ошибка при подтверждении приложения:', error);
      alert('Ошибка при подтверждении приложения.');
    }
  };

  const handleReject = async (appId: string) => {
    if (!rejectionReason) {
      alert('Пожалуйста, укажите причину отклонения.');
      return;
    }
    try {
      console.log('Rejecting app with userId:', userId);
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/admin/apps/${appId}/reject?userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error || 'Неизвестная ошибка'}`);
      }
      setApps(apps.map(app => app.id === appId ? { ...app, status: 'rejected', rejectionReason } : app));
      setRejectionReason('');
      alert('Приложение успешно отклонено!');
    } catch (error) {
      console.error('Ошибка при отклонении приложения:', error);
      alert('Ошибка при отклонении приложения.');
    }
  };

  if (!isTelegram) {
    console.log('Not in Telegram environment');
    return (
      <div className="content">
        <h2>Ошибка</h2>
        <p>Это приложение должно быть запущено через Telegram.</p>
      </div>
    );
  }

  if (error) {
    console.log('Error state:', error);
    return (
      <div className="content">
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content slide-in">
      <section className="section">
        <h2 className="section-title">Модерация приложений</h2>
        {apps.filter(app => app.status === 'onModeration').map(app => (
          <div key={app.id} className="card">
            <h3 className="card-title">{app.name}</h3>
            <p className="card-text"><strong>Тип:</strong> {app.type}</p>
            <p className="card-text"><strong>Категория:</strong> {app.category}</p>
            <p className="card-text"><strong>Разработчик:</strong> {app.developerId}</p>
            <p className="card-text"><strong>Короткое описание:</strong> {app.shortDescription}</p>
            <div className="button-group">
              <button className="button" onClick={() => handleApprove(app.id)}>
                <FaCheck /> Подтвердить
              </button>
              <textarea
                placeholder="Причина отклонения"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input"
              />
              <button className="button" onClick={() => handleReject(app.id)}>
                <FaTimes /> Отклонить
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <h2 className="section-title">Статистика каталога</h2>
        {stats ? (
          <div className="card">
            <p className="card-text"><strong>Всего приложений:</strong> {stats.totalApps}</p>
            <p className="card-text"><strong>Всего переходов:</strong> {stats.totalClicks}</p>
            <p className="card-text"><strong>Всего Telegram Stars:</strong> {stats.totalStars}</p>
            <p className="card-text"><strong>Всего жалоб:</strong> {stats.totalComplaints}</p>
          </div>
        ) : (
          <p>Загрузка статистики...</p>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;