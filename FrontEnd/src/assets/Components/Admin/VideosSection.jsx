// VideosSection.jsx
const VideosSection = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const response = await fetch('http://localhost:3000/admin/videos', {
      credentials: 'include'
    });
    const data = await response.json();
    setVideos(data.videos || []);
  };

  return (
    <div className="videos-section">
      <div className="section-header">
        <h2>Gestión de Videos</h2>
      </div>
      {/* Tabla similar a GalleriesSection */}
    </div>
  );
};