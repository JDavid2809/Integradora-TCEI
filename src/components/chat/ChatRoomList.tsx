import React from 'react'
import { 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  User, 
  MessageCircle, 
  Users, 
  LogOut, 
  UserPlus,
  Hash,
  HeadphonesIcon,
  Lock,
  Loader2
} from 'lucide-react'

interface ChatRoomListProps {
  isChatListMinimized: boolean
  setIsChatListMinimized: (value: boolean) => void
  isSearchMode: boolean
  handleToggleSearchMode: () => void
  setShowCreateRoom: (value: boolean) => void
  searchQuery: string
  handleUserSearch: (query: string) => void
  searchResults: any[]
  loading: boolean
  chatRooms: any[]
  activeRoom: any
  setActiveRoom: (room: any) => void
  handleStartPrivateChat: (userId: number) => void
  handleJoinRoom: (roomId: number) => void
  handleLeaveRoom: (roomId: number) => void
  isUserInRoom: (roomId: number) => boolean
  // Mobile overlay options
  isMobile?: boolean
  openMobile?: boolean
  onCloseMobile?: () => void
}

export default function ChatRoomList({
  isChatListMinimized,
  setIsChatListMinimized,
  isSearchMode,
  handleToggleSearchMode,
  setShowCreateRoom,
  searchQuery,
  handleUserSearch,
  searchResults,
  loading,
  chatRooms,
  activeRoom,
  setActiveRoom,
  handleStartPrivateChat,
  handleJoinRoom,
  handleLeaveRoom,
  isUserInRoom
  , isMobile
  , openMobile
  , onCloseMobile
}: ChatRoomListProps) {
  const [topOffset, setTopOffset] = React.useState(0)
  const [navZIndex, setNavZIndex] = React.useState<number | null>(null)
  const [bottomOffset, setBottomOffset] = React.useState(0)

  React.useEffect(() => {
    if (!isMobile || !openMobile || typeof window === 'undefined') return
    // find a fixed top element (like navbar) and compute height
    const fixedTop = Array.from(document.querySelectorAll('body *')).find((el) => {
      const s = window.getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return (s.position === 'fixed' || s.position === 'sticky') && r.top === 0 && r.height > 0
    }) as HTMLElement | undefined
    if (fixedTop) {
      setTopOffset(Math.ceil(fixedTop.getBoundingClientRect().height))
      const z = window.getComputedStyle(fixedTop).zIndex
      const zNum = z && !isNaN(Number(z as any)) ? Number(z) : null
      setNavZIndex(zNum)
    } else {
      setTopOffset(0)
    }
    const fixedBottom = Array.from(document.querySelectorAll('body *')).find((el) => {
      const s = window.getComputedStyle(el)
      const r = (el as HTMLElement).getBoundingClientRect()
      return (s.position === 'fixed' || s.position === 'sticky') && Math.round(r.bottom) === window.innerHeight && r.height > 0
    }) as HTMLElement | undefined
    if (fixedBottom) {
      setBottomOffset(Math.ceil(fixedBottom.getBoundingClientRect().height))
    } else {
      setBottomOffset(0)
    }
  }, [isMobile, openMobile])

  const getRoomIcon = (tipo: string) => {
    switch (tipo) {
      case 'GENERAL':
        return <Hash className="w-4 h-4" />
      case 'SOPORTE':
        return <HeadphonesIcon className="w-4 h-4" />
      case 'CLASE':
        return <HeadphonesIcon className="w-4 h-4" />
      case 'PRIVADO':
        return <Lock className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  // Use mobile overlay: render full-screen when openMobile, otherwise render inline as normal
  if (isMobile && openMobile) {
    return (
      <div
        className={`fixed left-0 right-0 bg-white p-4 overflow-auto safe-area-top safe-area-bottom`}
        style={{ top: topOffset, bottom: bottomOffset, zIndex: navZIndex ? Math.max(0, navZIndex - 1) : undefined }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">Salas</h3>
            <div className="hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00246a]/20"
                placeholder="Buscar personas..."
                aria-label="Buscar personas"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="sm:hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00246a]/20"
                placeholder="Buscar..."
                aria-label="Buscar personas"
              />
            </div>
            <button onClick={() => onCloseMobile && onCloseMobile()} className="p-2 rounded-md bg-gray-50 text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {chatRooms.map(room => (
            <div key={room.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all cursor-pointer" onClick={() => { setActiveRoom(room); onCloseMobile && onCloseMobile() }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-gray-100 flex-shrink-0">
                  {getRoomIcon(room.tipo)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">{room.nombre}</span>
                    { (room.mensajes_no_leidos ?? 0) > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">{room.mensajes_no_leidos}</span> }
                  </div>
                  {!isMobile && <p className="text-xs text-gray-500 truncate">{room.descripcion || 'Sin descripción'}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${isChatListMinimized ? 'w-20' : 'w-80'} border-r border-gray-200 flex flex-col bg-white min-w-0 transition-all duration-300 shadow-sm z-10`}>
      {/* Header de salas */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          {!isChatListMinimized && <span className="font-bold text-xl text-gray-800">Mensajes</span>}
          <div className="flex items-center gap-2">
            {!isChatListMinimized && (
              <>
                <button
                  onClick={handleToggleSearchMode}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isSearchMode 
                      ? 'bg-red-50 text-red-600' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={isSearchMode ? "Cancelar búsqueda" : "Buscar usuarios"}
                >
                  {isSearchMode ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="p-2 hover:bg-blue-50 hover:text-[#00246a] rounded-full transition-all duration-200 text-gray-600"
                  title="Crear sala"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsChatListMinimized(!isChatListMinimized)}
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-full transition-all duration-200"
              title={isChatListMinimized ? "Expandir lista de chats" : "Minimizar lista de chats"}
            >
              {isChatListMinimized ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda integrada */}
        {!isChatListMinimized && isSearchMode && (
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00246a]/20 focus:border-[#00246a] text-sm transition-all"
              placeholder="Buscar personas..."
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Botones de acceso rápido cuando está minimizado */}
      {isChatListMinimized && (
        <div className="p-2 space-y-2 flex flex-col items-center border-b border-gray-100">
          <button
            onClick={handleToggleSearchMode}
            className={`w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center ${
              isSearchMode 
                ? 'bg-red-50 text-red-600' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isSearchMode ? "Cancelar búsqueda" : "Buscar usuarios"}
          >
            {isSearchMode ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowCreateRoom(true)}
            className="w-10 h-10 hover:bg-blue-50 hover:text-[#00246a] rounded-xl transition-all duration-200 text-gray-600 flex items-center justify-center"
            title="Crear sala"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Lista de salas o resultados de búsqueda */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 custom-scrollbar">
        {isSearchMode ? (
          // Mostrar resultados de búsqueda
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium mb-1 text-gray-600">
                  {searchQuery ? 'No encontrado' : 'Buscar usuarios'}
                </p>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                  {searchQuery ? 'Intenta con otro nombre o correo' : 'Escribe el nombre o correo para comenzar'}
                </p>
              </div>
            ) : (
              searchResults.map(user => (
                <div
                  key={user.id}
                  className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer group"
                  onClick={() => handleStartPrivateChat(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00246a] to-[#003875] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                        {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      {!isChatListMinimized && (
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{user.nombre}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      )}
                    </div>
                    {!isChatListMinimized && (
                      <button
                        className="p-2 text-[#00246a] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Iniciar Chat"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#00246a]" />
            {!isChatListMinimized && <p className="text-sm">Cargando...</p>}
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-8 h-8 opacity-50" />
            </div>
            {!isChatListMinimized && (
              <>
                <p className="text-sm font-medium text-gray-600">Sin conversaciones</p>
                <p className="text-xs text-gray-400 mt-1">Tus chats aparecerán aquí</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {chatRooms.map(room => (
              <div key={room.id} className="relative group">
                <button
                  onClick={() => setActiveRoom(room)}
                  className={`w-full ${isChatListMinimized ? 'p-2' : 'p-3'} text-left rounded-xl transition-all duration-200 ${
                    activeRoom?.id === room.id 
                      ? 'bg-[#00246a] text-white shadow-md shadow-blue-900/20' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title={isChatListMinimized ? room.nombre : undefined}
                >
                  {isChatListMinimized ? (
                    // Vista minimizada - solo icono
                    <div className="flex items-center justify-center relative">
                      <div className={`p-2.5 rounded-lg transition-all duration-200 ${
                        activeRoom?.id === room.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-[#00246a]'
                      }`}>
                        {getRoomIcon(room.tipo)}
                      </div>
                      {(room.mensajes_no_leidos ?? 0) > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white">
                          {(room.mensajes_no_leidos ?? 0) > 9 ? '9+' : room.mensajes_no_leidos}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Vista expandida - completa
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                        activeRoom?.id === room.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-[#00246a]'
                      }`}>
                        {getRoomIcon(room.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`font-semibold text-sm truncate ${
                            activeRoom?.id === room.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            {room.nombre}
                          </span>
                          {(room.mensajes_no_leidos ?? 0) > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold shadow-sm">
                              {room.mensajes_no_leidos}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate max-w-[140px] ${
                            activeRoom?.id === room.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {room.descripcion || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
                
                {/* Botones de acciones en hover - solo en vista expandida */}
                {!isChatListMinimized && room.tipo !== 'PRIVADO' && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {isUserInRoom(room.id) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLeaveRoom(room.id)
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors shadow-sm border border-red-100"
                        title="Salir de la sala"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinRoom(room.id)
                        }}
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors shadow-sm border border-green-100"
                        title="Unirse a la sala"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
