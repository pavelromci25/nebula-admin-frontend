import { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { FaCheck, FaTimes, FaChartBar, FaList, FaCheckCircle, FaUserPlus } from 'react-icons/fa';

interface App {
  id: string;
  type: 'game' | 'app';
  name: string;
  shortDescription: string;
  longDescription?: string;
  categoryGame?: string;
  categoryApps?: string;
  additionalCategoriesGame?: string[];
  additionalCategoriesApps?: string[];
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
  linkApp?: string;
  startPromoCatalog?: string;
  finishPromoCatalog?: string;
  startPromoCategory?: string;
  finishPromoCategory?: string;
  editCount?: number;
}

interface Stat {
  totalApps: number;
  totalClicks: number;
  totalStars: number;
  totalComplaints: number;
  allowedDeveloperIds: string[];
}

const AdminDashboard: React.FC = () => {
  const { userId, isTelegram } = useTelegram();
  const [apps, setApps] = useState<App[]>([]);
  const [stats, setStats] = useState<Stat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'onModeration' | 'added' | 'stats'>('onModeration');
  const [newDeveloperId, setNewDeveloperId] = useState<string>('');

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
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        setError('Не удалось загрузить приложения. Попробуйте позже: ' + errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при подтверждении приложения: ' + errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при отклонении приложения: ' + errorMessage);
    }
  };

  const handleAddDeveloper = async () => {
    if (!newDeveloperId) {
      alert('Пожалуйста, введите Telegram ID разработчика.');
      return;
    }
    try {
      console.log('Adding developer with userId:', userId, 'developerId:', newDeveloperId);
      const response = await fetch(`https://nebula-server-ypun.onrender.com/api/admin/add-developer?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerId: newDeveloperId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorData.error || 'Неизвестная ошибка'}`);
      }
      const result = await response.json();
      console.log('Add developer result:', result);
      setStats(prev => prev ? { ...prev, allowedDeveloperIds: result.allowedDeveloperIds } : prev);
      setNewDeveloperId('');
      alert(result.message);
    } catch (error) {
      console.error('Ошибка при добавлении разработчика:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('Ошибка при добавлении разработчика: ' + errorMessage);
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
      <div className="bottom-menu">
        <button
          className={`menu-item ${activeTab === 'onModeration' ? 'active' : ''}`}
          onClick={() => setActiveTab('onModeration')}
        >
          <FaList className="menu-icon" />
          На модерации
        </button>
        <button
          className={`menu-item ${activeTab === 'added' ? 'active' : ''}`}
          onClick={() => setActiveTab('added')}
        >
          <FaCheckCircle className="menu-icon" />
          Одобренные
        </button>
        <button
          className={`menu-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <FaChartBar className="menu-icon" />
          Статистика
        </button>
      </div>

      {activeTab === 'onModeration' && (
        <section className="section">
          <h2 className="section-title">На модерации</h2>
          {apps.filter(app => app.status === 'onModeration').map(app => (
            <div key={app.id} className="card">
              <h3 className="card-title">{app.name}</h3>
              <p className="card-text"><strong>Тип:</strong> {app.type}</p>
              <p className="card-text"><strong>Категория:</strong> {app.type === 'game' ? app.categoryGame : app.categoryApps}</p>
              <p className="card-text"><strong>Разработчик:</strong> {app.developerId}</p>
              <p className="card-text"><strong>Короткое описание:</strong> {app.shortDescription}</p>
              <p className="card-text"><strong>Количество редакций:</strong> {app.editCount || 0}</p>
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
      )}

      {activeTab === 'added' && (
        <section className="section">
          <h2 className="section-title">Одобренные</h2>
          {apps.filter(app => app.status === 'added').map(app => (
            <div key={app.id} className="card">
              <h3 className="card-title">{app.name}</h3>
              <p className="card-text"><strong>Тип:</strong> {app.type}</p>
              <p className="card-text"><strong>Категория:</strong> {app.type === 'game' ? app.categoryGame : app.categoryApps}</p>
              <p className="card-text"><strong>Разработчик:</strong> {app.developerId}</p>
              <p className="card-text"><strong>Короткое описание:</strong> {app.shortDescription}</p>
              <p className="card-text"><strong>Количество редакций:</strong> {app.editCount || 0}</p>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'stats' && (
        <section className="section">
          <h2 className="section-title">Статистика каталога</h2>
          {stats ? (
            <div className="card">
              <p className="card-text"><strong>Всего приложений:</strong> {stats.totalApps}</p>
              <p className="card-text"><strong>Всего переходов:</strong> {stats.totalClicks}</p>
              <p className="card-text"><strong>Всего Telegram Stars:</strong> {stats.totalStars}</p>
              <p className="card-text"><strong>Всего жалоб:</strong> {stats.totalComplaints}</p>
              <h3 className="section-title">Разрешённые разработчики</h3>
              <ul>
                {stats.allowedDeveloperIds.map(id => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Telegram ID разработчика"
                value={newDeveloperId}
                onChange={(e) => setNewDeveloperId(e.target.value)}
                className="input"
              />
              <button className="button" onClick={handleAddDeveloper}>
                <FaUserPlus /> Добавить разработчика
              </button>
            </div>
          ) : (
            <p>Загрузка статистики...</p>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;