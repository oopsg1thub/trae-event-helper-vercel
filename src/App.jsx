import { useState, useRef, useEffect } from 'react'
import { UserPlus, Gift, Edit2, Check, X, Download, Users, Trophy, RefreshCw, Upload, CheckCircle, XCircle, Trash2, FileText } from 'lucide-react'
import './index.css'

const TAGS = [
  { value: 'student', label: '学生', color: 'text-cyan-400 border-cyan-400' },
  { value: 'kol', label: 'KOL', color: 'text-purple-400 border-purple-400' },
  { value: 'enterprise', label: '企业代表', color: 'text-green-400 border-green-400' },
]

const TAG_MAP = {
  'student': 'student',
  '学生': 'student',
  'kol': 'kol',
  'KOL': 'kol',
  'enterprise': 'enterprise',
  '企业代表': 'enterprise',
  '企业': 'enterprise',
}

function App() {
  const [activeTab, setActiveTab] = useState('checkin')
  const [participants, setParticipants] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [batchInput, setBatchInput] = useState('')
  const [showBatchImport, setShowBatchImport] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingTag, setEditingTag] = useState('')
  const [noteId, setNoteId] = useState(null)
  const [noteInput, setNoteInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [winner, setWinner] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [displayNumber, setDisplayNumber] = useState('000')
  const [displayName, setDisplayName] = useState('等待抽奖')
  const drawAnimationRef = useRef(null)
  
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  })

  useEffect(() => {
    const savedData = localStorage.getItem('trae-event-data')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setParticipants(data)
      } catch (e) {
        console.error('Failed to load data from localStorage:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('trae-event-data', JSON.stringify(participants))
    }
  }, [participants, isLoaded])

  const handleAddParticipant = () => {
    if (!nameInput.trim()) return
    
    const newParticipant = {
      id: Date.now(),
      number: participants.length + 1,
      name: nameInput.trim(),
      tag: selectedTag,
      isWinner: false,
      isCheckedIn: true,
      checkinTime: new Date().toLocaleString('zh-CN'),
      note: ''
    }
    
    setParticipants([...participants, newParticipant])
    setNameInput('')
    setSelectedTag('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddParticipant()
    }
  }

  const parseTag = (tagStr) => {
    if (!tagStr) return ''
    const normalized = tagStr.trim().toLowerCase()
    for (const [key, value] of Object.entries(TAG_MAP)) {
      if (key.toLowerCase() === normalized) {
        return value
      }
    }
    return ''
  }

  const handleBatchImport = () => {
    if (!batchInput.trim()) return
    
    const lines = batchInput.split('\n')
    let maxNumber = participants.length
    
    const newParticipants = lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.trim().split(/\s+/)
        const name = parts[0]
        let tag = ''
        
        if (parts.length > 1) {
          tag = parseTag(parts[1])
        }
        
        maxNumber++
        return {
          id: Date.now() + Math.random(),
          number: maxNumber,
          name: name,
          tag: tag,
          isWinner: false,
          isCheckedIn: false,
          checkinTime: '',
          note: ''
        }
      })
    
    setParticipants([...participants, ...newParticipants])
    setBatchInput('')
    setShowBatchImport(false)
  }

  const toggleCheckIn = (participant) => {
    setParticipants(participants.map(p => 
      p.id === participant.id 
        ? { 
            ...p, 
            isCheckedIn: !p.isCheckedIn,
            checkinTime: !p.isCheckedIn ? new Date().toLocaleString('zh-CN') : ''
          }
        : p
    ))
  }

  const deleteParticipant = (participant) => {
    setConfirmModal({
      show: true,
      title: '删除确认',
      message: `确定要删除 "${participant.name}" 吗？`,
      onConfirm: () => {
        setParticipants(participants.filter(p => p.id !== participant.id))
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
      }
    })
  }

  const startNoteEdit = (participant) => {
    setNoteId(participant.id)
    setNoteInput(participant.note || '')
  }

  const saveNote = () => {
    setParticipants(participants.map(p => 
      p.id === noteId 
        ? { ...p, note: noteInput.trim() }
        : p
    ))
    setNoteId(null)
    setNoteInput('')
  }

  const cancelNoteEdit = () => {
    setNoteId(null)
    setNoteInput('')
  }

  const startEditing = (participant) => {
    setEditingId(participant.id)
    setEditingName(participant.name)
    setEditingTag(participant.tag)
  }

  const saveEdit = () => {
    if (!editingName.trim()) return
    
    setParticipants(participants.map(p => 
      p.id === editingId 
        ? { ...p, name: editingName.trim(), tag: editingTag }
        : p
    ))
    setEditingId(null)
    setEditingName('')
    setEditingTag('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditingTag('')
  }

  const getTagLabel = (tagValue) => {
    const tag = TAGS.find(t => t.value === tagValue)
    return tag ? tag.label : ''
  }

  const getTagColor = (tagValue) => {
    const tag = TAGS.find(t => t.value === tagValue)
    return tag ? tag.color : 'text-gray-400 border-gray-400'
  }

  const filteredParticipants = () => {
    if (!searchQuery.trim()) return participants
    
    const query = searchQuery.toLowerCase().trim()
    return participants.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(query)
      const tagLabel = getTagLabel(p.tag).toLowerCase().includes(query)
      return nameMatch || tagLabel
    })
  }

  const getEligibleParticipants = () => {
    return participants.filter(p => !p.isWinner && p.isCheckedIn)
  }

  const [isStopping, setIsStopping] = useState(false)

  const startDraw = () => {
    const eligible = getEligibleParticipants()
    if (eligible.length === 0) {
      setDisplayName('无可用参与者')
      return
    }
    
    setIsDrawing(true)
    setIsStopping(false)
    setWinner(null)
    
    const animate = () => {
      const randomIndex = Math.floor(Math.random() * eligible.length)
      const randomParticipant = eligible[randomIndex]
      setDisplayNumber(String(randomParticipant.number).padStart(3, '0'))
      setDisplayName(randomParticipant.name)
      
      drawAnimationRef.current = setTimeout(animate, 80)
    }
    
    animate()
  }

  const stopDraw = () => {
    const eligible = getEligibleParticipants()
    if (eligible.length === 0) {
      setIsDrawing(false)
      return
    }
    
    setIsStopping(true)
    const randomIndex = Math.floor(Math.random() * eligible.length)
    const selectedWinner = eligible[randomIndex]
    
    if (drawAnimationRef.current) {
      clearTimeout(drawAnimationRef.current)
    }
    
    const slowdownSteps = 6
    let currentStep = 0
    
    const slowdownAnimate = () => {
      currentStep++
      
      if (currentStep <= slowdownSteps) {
        const speed = 60 + currentStep * 40
        const randomIndex = Math.floor(Math.random() * eligible.length)
        const randomParticipant = eligible[randomIndex]
        setDisplayNumber(String(randomParticipant.number).padStart(3, '0'))
        setDisplayName(randomParticipant.name)
        
        drawAnimationRef.current = setTimeout(slowdownAnimate, speed)
      } else {
        setIsDrawing(false)
        setIsStopping(false)
        setWinner(selectedWinner)
        setDisplayNumber(String(selectedWinner.number).padStart(3, '0'))
        
        setParticipants(participants.map(p => 
          p.id === selectedWinner.id ? { ...p, isWinner: true } : p
        ))
        
        setTimeout(() => {
          setShowModal(true)
        }, 200)
      }
    }
    
    slowdownAnimate()
  }

  const exportData = () => {
    const csvContent = [
      ['编号', '姓名', '标签', '是否签到', '是否中奖', '备注', '签到时间'].join(','),
      ...participants.map(p => [
        p.number,
        p.name,
        getTagLabel(p.tag) || '无',
        p.isCheckedIn ? '是' : '否',
        p.isWinner ? '是' : '否',
        p.note || '',
        p.checkinTime || ''
      ].join(','))
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `活动数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }



  useEffect(() => {
    return () => {
      if (drawAnimationRef.current) {
        clearTimeout(drawAnimationRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#1a1b1d] text-[#f0f0f0] font-mono">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center text-[#00ff88] mb-6 pb-4 border-b border-[#888888]">
          &gt; 线下活动管理助手 &lt;
        </h1>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'checkin'
                ? 'bg-[#00ff88]/20 text-[#00ff88] border-2 border-[#00ff88]'
                : 'bg-[#888888]/20 text-gray-400 hover:text-[#00ff88] hover:border-[#00ff88]/50 border-2 border-[#888888]'
            }`}
          >
            <UserPlus size={20} />
            签到
          </button>
          <button
            onClick={() => setActiveTab('lottery')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'lottery'
                ? 'bg-[#00ff88]/20 text-[#00ff88] border-2 border-[#00ff88]'
                : 'bg-[#888888]/20 text-gray-400 hover:text-[#00ff88] hover:border-[#00ff88]/50 border-2 border-[#888888]'
            }`}
          >
            <Gift size={20} />
            抽奖
          </button>
        </div>

        {activeTab === 'checkin' && (
          <div className="bg-[#888888]/10 rounded-xl border border-[#888888] p-6">
            {showBatchImport && (
              <div className="mb-6 p-4 bg-[#888888]/10 rounded-lg border border-[#888888]">
                <div className="text-sm text-gray-400 mb-3">
                  格式：姓名 + 空格/tab + 标签（可选）&nbsp;&nbsp;示例：
                  <br />- 张三 KOL
                  <br />- 李四 学生
                  <br />- 王五 企业
                </div>
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="粘贴文本..."
                  className="w-full h-32 px-4 py-2 rounded-lg geek-input resize-none"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleBatchImport}
                    disabled={!batchInput.trim()}
                    className="px-6 py-2 bg-[#00ff88] text-[#0f172a] rounded-lg hover:bg-[#00cc6a] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-bold"
                  >
                    导入
                  </button>
                  <button
                    onClick={() => setBatchInput('')}
                    className="px-6 py-2 border-2 border-gray-500 text-gray-400 rounded-lg hover:border-gray-300 hover:text-gray-300 transition-all"
                  >
                    清空
                  </button>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  批量导入人员默认未签到状态
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-lg font-medium text-[#00ff88] mb-2">
                现场录入 <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入姓名后按回车添加"
                  className="flex-1 px-4 py-2 rounded-lg geek-input"
                />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-4 py-2 rounded-lg geek-select sm:w-48"
                >
                  <option value="">选择标签（可选）</option>
                  {TAGS.map(tag => (
                    <option key={tag.value} value={tag.value}>{tag.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddParticipant}
                  disabled={!nameInput.trim()}
                  className="flex items-center gap-2 px-4.5 py-2 bg-[#00ff88] text-[#0f172a] rounded-lg hover:bg-[#00cc6a] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-bold"
                >
                  <UserPlus size={18} />
                  添加人员
                </button>
                <button
                  onClick={() => setShowBatchImport(!showBatchImport)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#888888]/20 text-[#00ff88] rounded-lg border-2 border-[#888888] hover:border-[#00ff88] hover:bg-[#00ff88]/10 transition-all"
                >
                  <Upload size={18} />
                  {showBatchImport ? '收起' : '批量导入'}
                </button>
              </div>
            </div>

            <div className="border-t border-[#888888] pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-[#00ff88]" />
                  <h2 className="text-lg font-semibold text-[#00ff88]">
                    已签到人员 ({participants.filter(p => p.isCheckedIn).length}/{participants.length}人)
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索姓名或标签..."
                    className="px-4 py-2 rounded-lg geek-input sm:w-48"
                  />
                  <button
                    onClick={exportData}
                    disabled={participants.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[#888888]/20 text-[#00ff88] rounded-lg border-2 border-[#888888] hover:border-[#00ff88] hover:bg-[#00ff88]/10 disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <Download size={18} />
                    导出数据
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        show: true,
                        title: '重置确认',
                        message: '确定要清空所有数据吗？此操作不可恢复！',
                        onConfirm: () => {
                          setParticipants([])
                          setConfirmModal({ show: false, title: '', message: '', onConfirm: null })
                        }
                      })
                    }}
                    disabled={participants.length === 0}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-red-400 text-red-400 rounded-lg hover:bg-red-500/10 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <RefreshCw size={18} />
                    重置列表
                  </button>
                </div>
              </div>
              
              {filteredParticipants().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-3 opacity-50" />
                  <p>{searchQuery.trim() ? '无匹配结果' : '暂无签到人员'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredParticipants().map((participant) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                        participant.isWinner ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-[#888888]/10 hover:bg-[#888888]/20'
                      }`}
                    >
                      {editingId === participant.id ? (
                        <>
                          <span className="text-gray-500 text-sm w-10 flex-shrink-0">
                            #{String(participant.number).padStart(3, '0')}
                          </span>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 px-3 py-1 rounded geek-input"
                            autoFocus
                          />
                          <select
                            value={editingTag}
                            onChange={(e) => setEditingTag(e.target.value)}
                            className="px-3 py-1 rounded geek-select"
                          >
                            <option value="">无标签</option>
                            {TAGS.map(tag => (
                              <option key={tag.value} value={tag.value}>{tag.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={saveEdit}
                            className="p-1.5 text-[#00ff88] hover:bg-[#00ff88]/10 rounded transition-colors"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : noteId === participant.id ? (
                        <>
                          <span className="text-gray-500 text-sm w-10 flex-shrink-0">
                            #{String(participant.number).padStart(3, '0')}
                          </span>
                          <span className="flex-1 font-medium text-[#f0f0f0]">
                            {participant.name}
                          </span>
                          <input
                            type="text"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                            placeholder="输入备注..."
                            className="w-32 px-2 py-1 rounded geek-input"
                            autoFocus
                          />
                          <button
                            onClick={saveNote}
                            className="p-1.5 text-[#00ff88] hover:bg-[#00ff88]/10 rounded transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelNoteEdit}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500 text-sm w-10 flex-shrink-0">
                            #{String(participant.number).padStart(3, '0')}
                          </span>
                          <span className="flex-1 font-medium text-[#f0f0f0]">
                            {participant.name}
                          </span>
                          {participant.tag && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTagColor(participant.tag)}`}>
                              {getTagLabel(participant.tag)}
                            </span>
                          )}
                          {participant.note && (
                            <span className="px-2 py-0.5 text-xs text-yellow-400 border border-yellow-400/30 rounded-full">
                              有备注
                            </span>
                          )}
                          {participant.isWinner && (
                            <span className="flex items-center gap-1 text-yellow-400 text-sm">
                              <Trophy size={14} />
                            </span>
                          )}
                          <button
                            onClick={() => toggleCheckIn(participant)}
                            className={`p-1.5 rounded transition-colors ${
                              participant.isCheckedIn 
                                ? 'text-[#00ff88] hover:bg-[#00ff88]/10' 
                                : 'text-gray-500 hover:bg-gray-500/10'
                            }`}
                            title={participant.isCheckedIn ? '取消签到' : '签到'}
                          >
                            {participant.isCheckedIn ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          </button>
                          <button
                            onClick={() => startNoteEdit(participant)}
                            className="p-1.5 text-gray-500 hover:text-[#00ff88] hover:bg-[#00ff88]/10 rounded transition-colors"
                            title="备注"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => startEditing(participant)}
                            className="p-1.5 text-gray-500 hover:text-[#00ff88] hover:bg-[#00ff88]/10 rounded transition-colors"
                            title="编辑"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteParticipant(participant)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lottery' && (
          <div className="bg-[#888888]/10 rounded-xl border border-[#888888] p-6 scanline-overlay relative">
            <div className="flex items-center gap-2 mb-6">
              <Gift size={24} className="text-[#00ff88]" />
              <h2 className="text-lg font-semibold text-[#00ff88]">幸运抽奖</h2>
            </div>
            
            <div className={
              "text-center py-10 rounded-xl mb-6 border-2 transition-all relative overflow-hidden " +
              (winner 
                ? "bg-yellow-500/10 border-yellow-500" 
                : isDrawing 
                  ? "bg-[#00ff88]/5 border-[#00ff88]" 
                  : "bg-[#888888]/20 border-[#888888]"
              )
            }>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
              </div>
              <div className={
                "text-7xl font-mono font-bold tracking-widest " +
                (winner ? "text-yellow-400" : isDrawing ? "text-[#00ff88]" : "text-gray-500") +
                " " + (isDrawing ? "slot-rolling" : "")
              }>
                {displayNumber}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={isDrawing && !isStopping ? stopDraw : startDraw}
                disabled={getEligibleParticipants().length === 0 || isStopping}
                className={`px-12 py-4 text-xl font-bold rounded-xl border-2 transition-all ${
                  isStopping
                    ? 'bg-red-500 text-[#0f172a] border-red-500'
                    : isDrawing
                    ? 'border-red-500 text-red-500 btn-breathe-red hover:bg-red-500/10'
                    : 'border-[#00ff88] text-[#00ff88] btn-breathe hover:bg-[#00ff88]/10 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed disabled:animate-none'
                }`}
              >
                {isStopping ? '抽奖中...' : isDrawing ? '停止' : '开始抽奖'}
              </button>
            </div>
            
            {getEligibleParticipants().length === 0 && participants.length > 0 && (
              <p className="text-center text-yellow-400 mt-4">
                所有参与者都已中奖或未签到
              </p>
            )}
            
            {participants.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                请先在签到页面添加参与者
              </p>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-500">
              剩余可抽奖: {getEligibleParticipants().length} / {participants.filter(p => p.isCheckedIn).length} (已签到)
            </div>
          </div>
        )}
      </div>

      {showModal && winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b1d] rounded-xl border-2 border-yellow-500 p-8 max-w-md w-full text-center modal-fade-in">
            <Trophy size={64} className="mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">
              恭喜中奖！
            </h2>
            <div className="text-7xl font-mono font-bold text-yellow-400 mb-8">
              {String(winner.number).padStart(3, '0')}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#00ff88] text-[#0f172a] rounded-lg hover:bg-[#00cc6a] transition-all font-bold"
            >
              确定
            </button>
          </div>
        </div>
      )}
      
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b1d] rounded-xl border-2 border-[#888888] p-8 max-w-md w-full text-center modal-fade-in">
            <h2 className="text-2xl font-bold text-[#00ff88] mb-4">
              {confirmModal.title}
            </h2>
            <p className="text-gray-300 mb-8">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                className="flex-1 py-3 border-2 border-gray-500 text-gray-400 rounded-lg hover:border-gray-300 hover:text-gray-300 transition-all font-bold"
              >
                取消
              </button>
              <button
                onClick={() => confirmModal.onConfirm?.()}
                className="flex-1 py-3 bg-red-500 text-[#0f172a] rounded-lg hover:bg-red-400 transition-all font-bold"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
