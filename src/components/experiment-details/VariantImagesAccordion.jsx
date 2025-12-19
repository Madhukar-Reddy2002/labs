// ============================================
// FILE: components/experiment-details/VariantImagesAccordion.jsx
// ============================================

import { useState } from 'react'
import { ChevronDown, ChevronUp, Image as ImageIcon, Upload, Maximize2, Monitor, Smartphone, Trophy, Lightbulb } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function VariantImagesAccordion({ variants, setVariants, projectId, setLightbox }) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(null)

  const handleImageUpload = async (e, variantId, type) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(`${variantId}-${type}`)
    const toastId = toast.loading("Uploading image...")

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('variant-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('variant-images').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const dbField = type === 'desktop' ? 'desktop_image_url' : 'mobile_image_url'
      
      const { error: dbError } = await supabase
        .from('variants')
        .update({ [dbField]: publicUrl })
        .eq('id', variantId)

      if (dbError) throw dbError

      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, [dbField]: publicUrl } : v))
      toast.success("Image uploaded!", { id: toastId })

    } catch (error) {
      toast.error("Upload failed", { id: toastId })
    } finally {
      setUploading(null)
    }
  }

  const winner = variants.find(v => v.uplift_percentage > 0 && !v.is_control)
  const hasImages = variants.some(v => v.desktop_image_url || v.mobile_image_url)

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="p-6 cursor-pointer hover:bg-white/40 transition-all flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <ImageIcon className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Variant Screenshots</h3>
              {!isOpen && (
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {hasImages ? `${variants.length} variants with screenshots` : 'Upload screenshots to compare'}
                </div>
              )}
            </div>
          </div>
          {isOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
        </div>

        {/* Content */}
        {isOpen && (
          <div className="px-6 pb-6 space-y-6">
            {variants.map((v) => (
              <div 
                key={v.id} 
                className={`bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-2xl p-6 border transition-all ${
                  winner?.id === v.id 
                    ? 'border-amber-300/50 shadow-lg shadow-amber-100/50' 
                    : 'border-white/60'
                }`}
              >
                {/* Variant Header */}
                <div className="flex justify-between items-center mb-5">
                  <h4 className="font-black text-lg text-slate-800 flex items-center gap-2">
                    {v.variant_name}
                    {v.is_control && (
                      <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-bold border border-slate-200">
                        Control
                      </span>
                    )}
                    {winner?.id === v.id && (
                      <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-200">
                        <Trophy size={10}/> Winner
                      </span>
                    )}
                  </h4>
                  <span className="text-xs font-bold text-slate-400 bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/60">
                    {v.split_percentage}% Traffic
                  </span>
                </div>

                {/* Changes Description */}
                {!v.is_control && v.changes_description && (
                  <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-blue-200/50">
                    <h5 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1.5">
                      <Lightbulb size={12}/> Changes Implemented
                    </h5>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{v.changes_description}</p>
                  </div>
                )}

                {/* Screenshot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['desktop', 'mobile'].map(type => (
                    <div key={type} className="group/img">
                      <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {type === 'desktop' ? (
                          <>
                            <Monitor size={13} className="text-slate-400"/> Desktop View
                          </>
                        ) : (
                          <>
                            <Smartphone size={13} className="text-slate-400"/> Mobile View
                          </>
                        )}
                      </div>
                      
                      <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden border-2 border-white/60 shadow-sm group-hover/img:shadow-md transition-all">
                        {v[`${type}_image_url`] ? (
                          <>
                            <img 
                              src={v[`${type}_image_url`]} 
                              alt={`${v.variant_name} ${type}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button 
                                onClick={() => setLightbox({ src: v[`${type}_image_url`] })} 
                                className="p-3 bg-white/20 hover:bg-white/40 rounded-xl text-white backdrop-blur-xl transition-all shadow-lg border border-white/20"
                              >
                                <Maximize2 size={18}/>
                              </button>
                              <label className="p-3 bg-white/20 hover:bg-white/40 rounded-xl text-white backdrop-blur-xl cursor-pointer transition-all shadow-lg border border-white/20">
                                <Upload size={18}/>
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="image/*" 
                                  onChange={(e) => handleImageUpload(e, v.id, type)} 
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-slate-100 transition-all text-slate-400 group-hover/img:text-slate-600">
                            {uploading === `${v.id}-${type}` ? (
                              <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full"/>
                            ) : (
                              <>
                                <div className="p-3 bg-white/60 rounded-xl mb-2 border border-slate-200">
                                  <ImageIcon size={20}/>
                                </div>
                                <span className="text-xs font-bold">Upload Screenshot</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              hidden 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, v.id, type)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}