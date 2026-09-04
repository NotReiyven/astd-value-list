import { usePresence, PresenceState } from "../../../hooks/usePresence";

const getInitials = (name: string) => {
  const parts = name.split(" ");
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0, 2).toUpperCase();
};

export function LiveAvatars() {
  const users = usePresence();
  
  if (users.length === 0) return null;

  const MAX_VISIBLE = 4;
  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const extraCount = Math.max(0, users.length - MAX_VISIBLE);

  return (
    <div className="flex items-center">
      {/* Mobile View: Compact Dot & Count */}
      <div className="flex md:hidden items-center gap-1.5 bg-[#1E1F22] border border-[rgba(255,255,255,0.06)] px-2 py-1 rounded-full shadow-inner mr-2">
        <span className="w-2 h-2 rounded-full bg-[#23a559] animate-pulse"></span>
        <span className="text-[10px] font-bold text-[#F2F3F5]">{users.length}</span>
      </div>

      {/* Desktop View: Overlapping Avatars */}
      <div className="hidden md:flex items-center mr-3 relative">
        {visibleUsers.map((user: PresenceState, i: number) => (
          <div
            key={user.id}
            className="w-7 h-7 rounded-full flex items-center justify-center border-[2px] border-[#313338] text-white text-[9px] font-bold shadow-sm relative group cursor-default transition-transform hover:-translate-y-1 hover:z-50"
            style={{ 
              backgroundColor: user.color,
              marginLeft: i > 0 ? "-8px" : "0",
              zIndex: 40 - i
            }}
          >
            {getInitials(user.name)}
            
            {/* Hover Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#111214] text-[#F2F3F5] text-[10px] font-bold px-2 py-1 rounded-[4px] border border-[rgba(255,255,255,0.08)] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg transition-opacity">
              {user.name}
            </div>
          </div>
        ))}

        {extraCount > 0 && (
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center border-[2px] border-[#313338] bg-[#1E1F22] text-[#DBDEE1] text-[9px] font-bold shadow-sm z-0"
            style={{ marginLeft: "-8px" }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  );
}