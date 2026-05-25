import React from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

interface Artist {
  id: string;
  fullName: string;
  bio: string;
  avatarUrl?: string;
  nationality?: string;
  type?: "ACTOR" | "DIRECTOR";
}

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-5 border border-slate-100 p-2.5 rounded bg-white shadow-xs transition-all duration-300">
      {/* Left: Avatar */}
      <Link
        to={`/cinematic/artist/${artist.id}`}
        className="w-full sm:w-52 h-48 sm:h-44 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center cursor-pointer"
      >
        {artist.avatarUrl ? (
          <img
            src={artist.avatarUrl}
            alt={artist.fullName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <User size={48} className="text-slate-300" />
        )}
      </Link>

      {/* Right: Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <Link
            to={`/cinematic/artist/${artist.id}`}
            className="font-medium text-lg text-slate-800 hover:text-alpha-blue transition-colors line-clamp-1"
          >
            {artist.fullName}
          </Link>
          {artist.type && (
            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${artist.type === "ACTOR"
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "bg-purple-50 text-purple-600 border border-purple-100"
              }`}>
              {artist.type === "ACTOR" ? "Diễn viên" : "Đạo diễn"}
            </span>
          )}
        </div>

        {artist.nationality && (
          <span className="text-xs text-slate-400 mt-1">
            Quốc tịch: {artist.nationality}
          </span>
        )}

        <p className="text-slate-500 text-sm mt-2.5 line-clamp-3 leading-relaxed text-justify">
          {artist.bio || "Chưa có tiểu sử chi tiết cho nghệ sĩ này."}
        </p>
      </div>
    </div>
  );
};

export default ArtistCard;
