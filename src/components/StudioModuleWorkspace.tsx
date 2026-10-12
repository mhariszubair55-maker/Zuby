import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  AudioWaveform,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileJson,
  Film,
  FolderKanban,
  Gamepad2,
  History,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Mic,
  Minimize2,
  Music,
  Pause,
  Play,
  RefreshCw,
  Share2,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import {
  buildUserAuthHeaders,
  saveUserArtifactToFirestore,
  type AppUserSession,
} from '../firebase';
import sherScene3NetTrapImg from '../assets/images/sher_cheenti_scene3_net_trap_1790635751412.jpg';
import sherScene4CuttingNetImg from '../assets/images/sher_cheenti_scene4_cutting_net_1790635765147.jpg';
import pixarMagicalAdventureImg from '../assets/images/pixar_magical_adventure_1790633528032.jpg';
import pixarFoxForestImg from '../assets/images/pixar_fox_rooster_forest_1790633480000.jpg';
import pixarFoxChaseImg from '../assets/images/pixar_fox_rooster_chase_1790633499455.jpg';
import pixarVeggieVillageImg from '../assets/images/pixar_veggie_village_1790633514432.jpg';
import pakistanVillage1Img from '../assets/images/pakistan_village_1791082823985.jpg';
import pakistanPathImg from '../assets/images/pakistan_path_1791082845106.jpg';
import pakistanFieldsImg from '../assets/images/pakistan_fields_1791082861107.jpg';
import pakVillageLifeImg from '../assets/images/pak_village_life_1791082416039.jpg';
import pakistaniVillageImg from '../assets/images/pakistani_village_1791082383382.jpg';

export type StudioModuleId =
  | 'video_studio'
  | 'dev_platform'
  | 'image_studio'
  | 'voice_dubbing'
  | 'music_sfx'
  | 'story_generator'
  | 'execution_chat';

export interface StudioModuleConfig {
  id: StudioModuleId;
  emoji: string;
  label: string;
  shortLabel: string;
  subtitle: string;
}

export const STUDIO_MODULES: StudioModuleConfig[] = [
  {
    id: 'video_studio',
    emoji: '🎬',
    label: 'AI Video Studio',
    shortLabel: 'Video Studio',
    subtitle: 'Prompt-to-Video, 9:16 vertical 3D CGI animation, multi-scene lip-sync & Veo MP4 pipeline',
  },
  {
    id: 'execution_chat',
    emoji: '💬',
    label: 'Chat & Canvas',
    shortLabel: 'Chat / Agent',
    subtitle: 'Unified AI assistant, code generator & live split preview canvas',
  },
  {
    id: 'dev_platform',
    emoji: '💻',
    label: 'Developer Platform',
    shortLabel: 'Dev Platform',
    subtitle: 'Multi-file architect, in-browser runner, log analyzer & Git diff',
  },
  {
    id: 'image_studio',
    emoji: '🖼️',
    label: 'AI Image Generator',
    shortLabel: 'AI Image',
    subtitle: 'Imagen 3 HD canvas & character design',
  },
  {
    id: 'voice_dubbing',
    emoji: '🎙️',
    label: 'Voiceover & Dubbing',
    shortLabel: 'Voiceover',
    subtitle: 'Multi-character voice, accent & lip-sync pipeline',
  },
  {
    id: 'music_sfx',
    emoji: '🎵',
    label: 'AI Music & SFX',
    shortLabel: 'Music & SFX',
    subtitle: 'Background scores & ambient sound generator',
  },
  {
    id: 'story_generator',
    emoji: '📖',
    label: 'Story Generator',
    shortLabel: 'Story Script',
    subtitle: 'Scriptwriting, scene breakdown & prompt builder',
  },
  {
    id: 'execution_chat',
    emoji: '💬',
    label: 'Execution Chat',
    shortLabel: 'AI Chat',
    subtitle: 'Unified AI assistant & direct workflow routing',
  },
];

interface DialogueTurn {
  id: string;
  speaker: string;
  voice: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  pitch: number;
  englishLine: string;
  urduLine: string;
  romanUrduLine?: string;
  spokenLanguage?: 'urdu' | 'english' | 'roman_urdu' | 'bilingual';
  cameraAngle: string;
  durationSec?: number;
  audioDataUrl?: string;
  audioUrl?: string;
  lipSyncEnvelope?: number[];
  synthError?: string;
}

export interface SavedAudioVaultClip {
  id: string;
  title: string;
  speakerName: string;
  voiceName: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  pitch: number;
  language: 'urdu' | 'english' | 'roman_urdu' | 'bilingual';
  dialogueText: string;
  dialogueUrdu?: string;
  dialogueRomanUrdu?: string;
  durationSec: number;
  lipSyncEnvelope: number[];
  modelUsed: string;
  audioUrl: string;
  createdAt: string;
}

interface StorySceneDraft {
  sceneNumber: number;
  headline: string;
  cameraAngle: string;
  speaker: string;
  voice: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  dialogueEnglish: string;
  dialogueUrdu: string;
  visualPrompt3D: string;
  sfxMood: string;
}

export type StudioAspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
export type StudioImageQuality = '512px' | '1K' | '2K' | '4K';

export interface StudioGeneratedImage {
  id: string;
  ownerUid: string;
  projectId: number | null;
  projectTitle?: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  stylePreset: string;
  aspectRatio: StudioAspectRatio;
  quality: StudioImageQuality;
  modelUsed: string;
  url: string;
  sourceType: 'gemini_image' | 'imagen3' | 'studio_hd_render';
  parentImageId?: string;
  editInstruction?: string;
  isFavorite?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudioProjectOption {
  id: number;
  title: string;
}

const ASPECT_RATIO_CONFIG: Array<{
  ratio: StudioAspectRatio;
  label: string;
  desc: string;
  baseWidth: number;
  baseHeight: number;
}> = [
  { ratio: '1:1', label: '1:1', desc: 'Square', baseWidth: 1080, baseHeight: 1080 },
  { ratio: '9:16', label: '9:16', desc: 'Vertical', baseWidth: 1080, baseHeight: 1920 },
  { ratio: '16:9', label: '16:9', desc: 'Widescreen', baseWidth: 1920, baseHeight: 1080 },
  { ratio: '4:3', label: '4:3', desc: 'Landscape', baseWidth: 1440, baseHeight: 1080 },
  { ratio: '3:4', label: '3:4', desc: 'Portrait', baseWidth: 1080, baseHeight: 1440 },
];

const QUALITY_CONFIG: Array<{
  quality: StudioImageQuality;
  label: string;
  badge: string;
  scale: number;
}> = [
  { quality: '512px', label: '512px', badge: 'Fast Draft', scale: 0.5 },
  { quality: '1K', label: '1K HD', badge: 'Standard HD', scale: 1 },
  { quality: '2K', label: '2K QHD', badge: 'Ultra Detail', scale: 1.5 },
  { quality: '4K', label: '4K Master', badge: 'Cinema 4K', scale: 2 },
];

export function ImageGeneratorWorkspace({
  onNotice,
  onSendToChat,
  currentUser = null,
  projects = [],
  activeProjectId = null,
  onSelectProject,
}: {
  onNotice: (msg: string) => void;
  onSendToChat: (prompt: string, imageUrl?: string) => void;
  currentUser?: AppUserSession | null;
  projects?: StudioProjectOption[];
  activeProjectId?: number | null;
  onSelectProject?: (projectId: number) => void;
}) {
  const userKey = currentUser?.uid || 'guest_default';
  const localStorageKey = `saz_ai_image_studio_v2_${userKey}`;

  const [studioMode, setStudioMode] = useState<'generate' | 'edit'>('generate');
  const [imageTitle, setImageTitle] = useState('');
  const [prompt, setPrompt] = useState(
    'Disney Pixar 3D CGI vertical 9:16 character portrait: majestic golden-maned lion Sher and tiny expressive ant Cheenti on a glowing emerald jungle leaf, volumetric sunbeams, 8k render',
  );
  const [negativePrompt, setNegativePrompt] = useState(
    'blurry, low resolution, watermark, distorted anatomy, cropped frame',
  );
  const [editInstruction, setEditInstruction] = useState(
    'Add warm golden hour volumetric sunbeams and glowing magical fireflies around the character',
  );
  const [uploadedEditSourceUrl, setUploadedEditSourceUrl] = useState<string | null>(null);
  const [uploadedEditSourceName, setUploadedEditSourceName] = useState<string>('');
  const [stylePreset, setStylePreset] = useState('Disney/Pixar 3D CGI');
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>('9:16');
  const [quality, setQuality] = useState<StudioImageQuality>('1K');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    activeProjectId ?? projects[0]?.id ?? 1,
  );

  // Non-destructive studio color adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<'generate' | 'edit' | null>(null);

  const [imageHistory, setImageHistory] = useState<StudioGeneratedImage[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'project' | 'favorites' | 'edited'>('all');
  const [historySearch, setHistorySearch] = useState('');

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [activeImage, setActiveImage] = useState<StudioGeneratedImage>({
    id: `starter-pakistan-village-${Date.now()}`,
    ownerUid: userKey,
    projectId: activeProjectId ?? 1,
    projectTitle: projects.find((p) => p.id === activeProjectId)?.title || 'SAZ AI Studio Suite',
    title: 'Rural Pakistani Village · 9:16 Cinematic Visual',
    prompt:
      'Cinematic vertical 9:16 view of a beautiful rural Pakistani village. Traditional mud-brick houses with textured earthen walls, lush green fields, dusty village path, natural daylight.',
    stylePreset: 'Cinematic 3D',
    aspectRatio: '9:16',
    quality: '1K',
    modelUsed: 'gemini-3.8-flash',
    url: pakistanVillage1Img,
    sourceType: 'gemini_image',
    isFavorite: true,
    tags: ['Cinematic 3D', '9:16', '1K'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (activeProjectId && activeProjectId !== selectedProjectId) {
      setSelectedProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  const presetGallery: Array<{
    title: string;
    url: string;
    prompt: string;
    aspectRatio: StudioAspectRatio;
    stylePreset: string;
  }> = [
    {
      title: 'Rural Pakistani Village · 9:16',
      url: pakistanVillage1Img,
      prompt:
        'Cinematic vertical 9:16 view of a beautiful rural Pakistani village. Traditional mud-brick houses, lush green fields, trees, and natural daylight.',
      aspectRatio: '9:16',
      stylePreset: 'Cinematic 3D',
    },
    {
      title: 'Village Path & Earthen Houses · 9:16',
      url: pakistanPathImg,
      prompt:
        'Cinematic 9:16 vertical shot of a village path between mud-brick houses in rural Pakistan, bright natural morning sunlight.',
      aspectRatio: '9:16',
      stylePreset: 'Cinematic 3D',
    },
    {
      title: 'Lush Agricultural Fields · 9:16',
      url: pakistanFieldsImg,
      prompt:
        'Cinematic vertical 9:16 portrait of golden and green agricultural fields in rural Pakistan, mud-brick farmhouse in background, clear open sky.',
      aspectRatio: '9:16',
      stylePreset: 'Cinematic 3D',
    },
    {
      title: 'Rooster Bell Twist · Action 3D',
      url: pixarFoxChaseImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16 action shot: clever rooster ringing the forest alarm bell as the fox dashes away.',
      aspectRatio: '9:16',
      stylePreset: 'Disney/Pixar 3D CGI',
    },
    {
      title: 'Vegetable Village · Pixar 3D World',
      url: pixarVeggieVillageImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16: cheerful animated tomato and carrot characters in a sunlit vegetable village.',
      aspectRatio: '9:16',
      stylePreset: 'Disney/Pixar 3D CGI',
    },
    {
      title: 'Magical Forest Finale · 3D Render',
      url: pixarMagicalAdventureImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16 finale: enchanted glowing fireflies over a sunlit emerald jungle rock.',
      aspectRatio: '9:16',
      stylePreset: 'Disney/Pixar 3D CGI',
    },
  ];

  // Load isolated per-user image history from backend + localStorage fallback
  useEffect(() => {
    let cancelled = false;
    async function loadUserImages() {
      try {
        const rawLocal = localStorage.getItem(localStorageKey);
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal) as StudioGeneratedImage[];
          if (Array.isArray(parsedLocal) && parsedLocal.length > 0 && !cancelled) {
            setImageHistory(parsedLocal);
            setActiveImage(parsedLocal[0]);
          }
        }
      } catch {
        // ignore localStorage parse error
      }

      try {
        const headers = await buildUserAuthHeaders(currentUser);
        const res = await fetch('/api/image-studio/images', { headers });
        if (!res.ok) return;
        const serverImages = (await res.json()) as StudioGeneratedImage[];
        if (!cancelled && Array.isArray(serverImages) && serverImages.length > 0) {
          setImageHistory(serverImages);
          setActiveImage(serverImages[0]);
          try {
            localStorage.setItem(localStorageKey, JSON.stringify(serverImages.slice(0, 40)));
          } catch {
            // ignore storage quota
          }
        }
      } catch {
        // fallback to local history
      }
    }
    void loadUserImages();
    return () => {
      cancelled = true;
    };
  }, [userKey, localStorageKey]);

  const persistHistoryList = (nextList: StudioGeneratedImage[]) => {
    setImageHistory(nextList);
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(nextList.slice(0, 40)));
    } catch {
      // ignore storage quota
    }
  };

  const syncImageArtifactToCloud = (record: StudioGeneratedImage) => {
    if (!currentUser?.uid) return;
    void saveUserArtifactToFirestore(currentUser.uid, {
      id: record.id,
      kind: 'image',
      title: record.title,
      description: `[Project #${record.projectId ?? 1} · ${record.aspectRatio} · ${record.quality} · ${record.stylePreset}] ${record.prompt}`,
      createdAt: record.createdAt,
    }).catch(() => {});
  };

  const handleUploadReferenceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorBanner('Unsupported file type. Please upload a PNG, JPG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorBanner('Image file exceeds the 8MB studio limit. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedEditSourceUrl(reader.result);
        setUploadedEditSourceName(file.name);
        setStudioMode('edit');
        setErrorBanner(null);
        onNotice(`Loaded "${file.name}" for AI Image Editing`);
      }
    };
    reader.onerror = () => {
      setErrorBanner('Failed to read image file. Please try another file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerateImage = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setErrorBanner('Please enter a prompt describing the image you want to generate.');
      return;
    }
    if (isGenerating) return;

    setIsGenerating(true);
    setErrorBanner(null);
    setLastFailedAction(null);
    onNotice(`Generating ${quality} (${aspectRatio}) image in SAZ AI Image Studio...`);

    const resolvedProject =
      projects.find((p) => p.id === selectedProjectId) || projects[0] || { id: 1, title: 'SAZ AI Studio Suite' };

    try {
      const headers = await buildUserAuthHeaders(currentUser, {
        'Content-Type': 'application/json',
      });
      const res = await fetch('/api/image-studio/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: imageTitle.trim() || undefined,
          prompt: cleanPrompt,
          negativePrompt: negativePrompt.trim() || undefined,
          stylePreset,
          aspectRatio,
          quality,
          projectId: resolvedProject.id,
        }),
      });

      const data = (await res.json()) as {
        image?: StudioGeneratedImage;
        error?: string;
      };

      if (!res.ok || !data.image) {
        throw new Error(data.error || `Image generation failed (${res.status}).`);
      }

      const created: StudioGeneratedImage = {
        ...data.image,
        projectId: data.image.projectId ?? resolvedProject.id,
        projectTitle: data.image.projectTitle || resolvedProject.title,
      };

      setActiveImage(created);
      setAspectRatio(created.aspectRatio);
      setQuality(created.quality);
      const updatedList = [created, ...imageHistory.filter((i) => i.id !== created.id)].slice(0, 60);
      persistHistoryList(updatedList);
      syncImageArtifactToCloud(created);
      onNotice(`Generated "${created.title}" (${created.aspectRatio} · ${created.quality})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image generation encountered an error.';
      setErrorBanner(msg);
      setLastFailedAction('generate');
      onNotice('Image generation failed — see studio error banner to retry');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async (customInstruction?: string) => {
    const cleanInstr = (customInstruction ?? editInstruction).trim();
    if (!cleanInstr) {
      setErrorBanner('Please enter an editing instruction describing how to modify the image.');
      return;
    }
    if (isGenerating) return;

    setIsGenerating(true);
    setErrorBanner(null);
    setLastFailedAction(null);
    onNotice(`Applying AI Image Edit (${aspectRatio} · ${quality})...`);

    const resolvedProject =
      projects.find((p) => p.id === selectedProjectId) || projects[0] || { id: 1, title: 'SAZ AI Studio Suite' };
    const sourceUrl = uploadedEditSourceUrl || activeImage.url;

    try {
      const headers = await buildUserAuthHeaders(currentUser, {
        'Content-Type': 'application/json',
      });
      const res = await fetch('/api/image-studio/edit', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sourceImageId: uploadedEditSourceUrl ? undefined : activeImage.id,
          sourceImageDataUrl: sourceUrl,
          instruction: cleanInstr,
          prompt: activeImage.prompt || prompt,
          stylePreset,
          aspectRatio,
          quality,
          projectId: resolvedProject.id,
        }),
      });

      const data = (await res.json()) as {
        image?: StudioGeneratedImage;
        error?: string;
      };

      if (!res.ok || !data.image) {
        throw new Error(data.error || `Image editing failed (${res.status}).`);
      }

      const editedRecord: StudioGeneratedImage = {
        ...data.image,
        projectId: data.image.projectId ?? resolvedProject.id,
        projectTitle: data.image.projectTitle || resolvedProject.title,
      };

      setActiveImage(editedRecord);
      const updatedList = [editedRecord, ...imageHistory.filter((i) => i.id !== editedRecord.id)].slice(0, 60);
      persistHistoryList(updatedList);
      syncImageArtifactToCloud(editedRecord);
      onNotice(`Edited image saved: "${editedRecord.title}"`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image editing encountered an error.';
      setErrorBanner(msg);
      setLastFailedAction('edit');
      onNotice('Image edit failed — see studio error banner');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = async (target: StudioGeneratedImage) => {
    const nextFav = !target.isFavorite;
    const optimistic: StudioGeneratedImage = { ...target, isFavorite: nextFav };
    const nextList = imageHistory.map((item) => (item.id === target.id ? optimistic : item));
    persistHistoryList(nextList);
    if (activeImage.id === target.id) {
      setActiveImage(optimistic);
    }

    try {
      const headers = await buildUserAuthHeaders(currentUser, {
        'Content-Type': 'application/json',
      });
      await fetch(`/api/image-studio/images/${encodeURIComponent(target.id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isFavorite: nextFav }),
      });
    } catch {
      // local state already updated
    }
  };

  const handleAssignImageProject = async (target: StudioGeneratedImage, nextProjectId: number) => {
    const projObj = projects.find((p) => p.id === nextProjectId);
    const optimistic: StudioGeneratedImage = {
      ...target,
      projectId: nextProjectId,
      projectTitle: projObj?.title || `Project #${nextProjectId}`,
    };
    const nextList = imageHistory.map((item) => (item.id === target.id ? optimistic : item));
    persistHistoryList(nextList);
    if (activeImage.id === target.id) {
      setActiveImage(optimistic);
    }
    onNotice(`Assigned "${target.title}" to ${optimistic.projectTitle}`);

    try {
      const headers = await buildUserAuthHeaders(currentUser, {
        'Content-Type': 'application/json',
      });
      await fetch(`/api/image-studio/images/${encodeURIComponent(target.id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ projectId: nextProjectId }),
      });
    } catch {
      // local state already updated
    }
  };

  const handleDeleteImage = async (target: StudioGeneratedImage) => {
    const remaining = imageHistory.filter((item) => item.id !== target.id);
    persistHistoryList(remaining);
    if (activeImage.id === target.id && remaining.length > 0) {
      setActiveImage(remaining[0]);
    }
    onNotice(`Removed "${target.title}" from Image Studio history`);

    try {
      const headers = await buildUserAuthHeaders(currentUser);
      await fetch(`/api/image-studio/images/${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
        headers,
      });
    } catch {
      // ignore network error
    }
  };

  const downloadFormattedImage = (targetImage: StudioGeneratedImage = activeImage) => {
    const ratioSpec =
      ASPECT_RATIO_CONFIG.find((r) => r.ratio === targetImage.aspectRatio) || ASPECT_RATIO_CONFIG[0];
    const qualitySpec =
      QUALITY_CONFIG.find((q) => q.quality === targetImage.quality) || QUALITY_CONFIG[1];

    const exportWidth = Math.round(ratioSpec.baseWidth * qualitySpec.scale);
    const exportHeight = Math.round(ratioSpec.baseHeight * qualitySpec.scale);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        if (exportFormat === 'jpeg') {
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mimeType =
          exportFormat === 'jpeg'
            ? 'image/jpeg'
            : exportFormat === 'webp'
              ? 'image/webp'
              : 'image/png';
        const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
        const safeSlug =
          targetImage.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 36) || 'saz-ai-image';

        const a = document.createElement('a');
        a.href = canvas.toDataURL(mimeType, 0.94);
        a.download = `${safeSlug}-${targetImage.aspectRatio.replace(':', 'x')}-${targetImage.quality}.${ext}`;
        a.click();
        onNotice(
          `Downloaded ${targetImage.quality} ${ext.toUpperCase()} (${exportWidth}×${exportHeight}px)`,
        );
      }
    };
    img.onerror = () => {
      setErrorBanner('Unable to export image canvas. Try regenerating or choosing PNG format.');
    };
    img.src = targetImage.url;
  };

  const exportImageMetadataJson = (targetImage: StudioGeneratedImage = activeImage) => {
    const payload = {
      studio: 'SAZ AI Image Studio',
      exportedAt: new Date().toISOString(),
      ownerUid: currentUser?.uid || 'guest_default',
      project: {
        id: targetImage.projectId,
        title:
          targetImage.projectTitle ||
          projects.find((p) => p.id === targetImage.projectId)?.title ||
          'SAZ AI Studio Suite',
      },
      image: targetImage,
      adjustments: { brightness, contrast, saturation },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetImage.id}-metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotice('Exported Image Studio JSON metadata');
  };

  const filteredHistory = imageHistory.filter((item) => {
    if (historyFilter === 'project' && selectedProjectId && item.projectId !== selectedProjectId) {
      return false;
    }
    if (historyFilter === 'favorites' && !item.isFavorite) {
      return false;
    }
    if (historyFilter === 'edited' && !item.editInstruction) {
      return false;
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      const hay = `${item.title} ${item.prompt} ${item.stylePreset} ${item.editInstruction || ''} ${item.projectTitle || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const canvasAspectClass =
    activeImage.aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[490px] w-auto'
      : activeImage.aspectRatio === '16:9'
        ? 'aspect-video w-full'
        : activeImage.aspectRatio === '4:3'
          ? 'aspect-[4/3] w-full max-h-[430px]'
          : activeImage.aspectRatio === '3:4'
            ? 'aspect-[3/4] max-h-[470px] w-auto'
            : 'aspect-square max-h-[430px] w-auto';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-2.5 sm:p-4">
      {/* Error Handling Banner */}
      {errorBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="shrink-0 text-rose-500" />
            <div>
              <span className="font-extrabold">Image Studio Alert: </span>
              <span>{errorBanner}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastFailedAction && (
              <button
                type="button"
                onClick={() =>
                  void (lastFailedAction === 'edit' ? handleEditImage() : handleGenerateImage())
                }
                className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 font-bold text-white transition hover:bg-rose-400"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="rounded-lg border border-rose-500/30 px-2.5 py-1 font-semibold hover:bg-rose-500/10"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Studio Controls */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            {/* Header & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
                  SAZ AI Image Studio
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Prompt-to-Image, AI Image Editing, Multi-Aspect Ratio &amp; 4K Project Gallery
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setStudioMode('generate')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    studioMode === 'generate'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Prompt to Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode('edit')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    studioMode === 'edit'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  <Wand2 size={13} />
                  <span>Edit Image</span>
                </button>
              </div>
            </div>

            {/* Project Organization & Title Row */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <FolderKanban size={13} className="text-amber-500" />
                  <span>Project Organization</span>
                </label>
                <select
                  value={selectedProjectId ?? ''}
                  onChange={(e) => {
                    const nextId = Number(e.target.value) || null;
                    setSelectedProjectId(nextId);
                    if (nextId && onSelectProject) {
                      onSelectProject(nextId);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {projects.length > 0 ? (
                    projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        📁 {p.title}
                      </option>
                    ))
                  ) : (
                    <option value={1}>📁 SAZ AI Studio Suite</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Asset Title (Optional)
                </label>
                <input
                  type="text"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  placeholder="e.g. Hero Banner / Character Concept..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {studioMode === 'generate' ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Image Generation Prompt
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Volumetric golden hour lighting',
                      '8K photorealistic macro lens',
                      'Subsurface scattering 3D',
                    ].map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() =>
                          setPrompt((prev) =>
                            prev.toLowerCase().includes(chip.toLowerCase())
                              ? prev
                              : `${prev.trim().replace(/,\s*$/, '')}, ${chip}`,
                          )
                        }
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your subject, environment, lighting, composition, and artistic style..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Negative Prompt (Elements to Exclude)
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, low quality, watermark, deformed hands, extra limbs..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 rounded-xl border border-amber-400/40 bg-amber-500/5 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      AI Image Editor · Source: {uploadedEditSourceName || activeImage.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Modify the active canvas image or upload a reference image to transform with Gemini Image
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadReferenceImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-800 transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <Upload size={12} />
                      <span>Upload Image</span>
                    </button>
                    {uploadedEditSourceUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedEditSourceUrl(null);
                          setUploadedEditSourceName('');
                          onNotice('Reverted edit source to active canvas image');
                        }}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        Use Canvas
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="Describe how to edit this image (e.g., 'Add golden sunset rays, change outfit to futuristic armor, enhance 4K detail')..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Add golden hour volumetric sunbeams & fireflies',
                    'Transform into Cyberpunk Neon night aesthetic',
                    'Enhance 4K macro fur & subsurface lighting',
                    'Change background to enchanted crystal cavern',
                  ].map((presetEdit) => (
                    <button
                      type="button"
                      key={presetEdit}
                      onClick={() => {
                        setEditInstruction(presetEdit);
                        void handleEditImage(presetEdit);
                      }}
                      disabled={isGenerating}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-300"
                    >
                      ✨ {presetEdit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Style Preset, Aspect Ratio & Quality Selector */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Visual Style Preset
                  </label>
                  <select
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Disney/Pixar 3D CGI">Disney / Pixar 3D CGI</option>
                    <option value="Photorealistic Studio 8K">Photorealistic Studio 8K</option>
                    <option value="Unreal Engine 5 Cinematic 3D">Unreal Engine 5 Cinematic 3D</option>
                    <option value="Cyberpunk Neon Concept">Cyberpunk Neon Concept Art</option>
                    <option value="DreamWorks Feature Animation 3D">DreamWorks Feature 3D</option>
                    <option value="Digital Watercolor & Ink">Digital Watercolor &amp; Ink</option>
                    <option value="Minimalist Vector Illustration">Minimalist Vector Illustration</option>
                    <option value="Stylized Claymation 3D">Stylized Stop-Motion 3D</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Quality &amp; Resolution Tier
                  </label>
                  <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    {QUALITY_CONFIG.map((q) => (
                      <button
                        type="button"
                        key={q.quality}
                        onClick={() => setQuality(q.quality)}
                        title={q.badge}
                        className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                          quality === q.quality
                            ? 'bg-amber-400 text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5 Aspect Ratios */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Canvas Aspect Ratio
                </label>
                <div className="grid grid-cols-5 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {ASPECT_RATIO_CONFIG.map((item) => (
                    <button
                      type="button"
                      key={item.ratio}
                      onClick={() => setAspectRatio(item.ratio)}
                      className={`flex flex-col items-center rounded-lg py-1.5 text-xs font-bold transition ${
                        aspectRatio === item.ratio
                          ? 'bg-amber-400 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[9px] font-medium opacity-75">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {studioMode === 'generate' ? (
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => void handleGenerateImage()}
                    className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300 disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    <span>
                      {isGenerating
                        ? `Generating ${quality} (${aspectRatio})...`
                        : `Generate ${quality} Image (${aspectRatio})`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => void handleEditImage()}
                    className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300 disabled:opacity-50"
                  >
                    <Wand2 size={14} />
                    <span>
                      {isGenerating ? 'Applying AI Image Edit...' : 'Apply AI Edit to Image'}
                    </span>
                  </button>
                )}

                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
                    className="rounded-l-lg bg-transparent px-2 py-2 text-xs font-bold text-slate-700 outline-none dark:text-slate-200"
                    aria-label="Export image format"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPG</option>
                    <option value="webp">WEBP</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => downloadFormattedImage(activeImage)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-700"
                  >
                    <Download size={13} />
                    <span>Export</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => exportImageMetadataJson(activeImage)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  title="Export JSON metadata and prompt settings"
                >
                  <FileJson size={14} />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSendToChat(
                      `Create a 5-scene 9:16 3D animated video story based on this character design: ${activeImage.prompt}`,
                      activeImage.url,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-slate-800 dark:bg-slate-800"
                >
                  <Film size={14} />
                  <span>Animate in 3D Video Studio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset 3D Character & Scene Library */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3D Character &amp; Scene Presets (Click to Load or Edit)
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Verified Studio Templates
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {presetGallery.map((item) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => {
                    setPrompt(item.prompt);
                    setAspectRatio(item.aspectRatio);
                    setStylePreset(item.stylePreset);
                    const loaded: StudioGeneratedImage = {
                      id: `preset-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                      ownerUid: userKey,
                      projectId: selectedProjectId ?? 1,
                      projectTitle:
                        projects.find((p) => p.id === selectedProjectId)?.title ||
                        'SAZ AI Studio Suite',
                      title: item.title,
                      prompt: item.prompt,
                      stylePreset: item.stylePreset,
                      aspectRatio: item.aspectRatio,
                      quality,
                      modelUsed: 'imagen-3-verified',
                      url: item.url,
                      sourceType: 'imagen3',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setActiveImage(loaded);
                    onNotice(`Loaded "${item.title}" into Canvas`);
                  }}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="aspect-[9/12] w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Canvas Preview & Non-Destructive Color Grading */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {activeImage.title}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  📁 {activeImage.projectTitle || 'SAZ AI Studio Suite'} · {activeImage.stylePreset}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                  {activeImage.aspectRatio}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {activeImage.quality}
                </span>
              </div>
            </div>

            <div
              className={`relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-slate-950 shadow-xl ${canvasAspectClass}`}
            >
              <img
                src={uploadedEditSourceUrl && studioMode === 'edit' ? uploadedEditSourceUrl : activeImage.url}
                alt={activeImage.title}
                referrerPolicy="no-referrer"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                }}
                className="h-full w-full object-cover transition-all duration-200"
              />
              {activeImage.editInstruction && (
                <span className="absolute top-2.5 left-2.5 rounded-lg bg-slate-950/85 px-2.5 py-1 text-[10px] font-bold text-amber-400 backdrop-blur-xs">
                  ✨ Edited: {activeImage.editInstruction.slice(0, 42)}
                </span>
              )}
            </div>

            <p className="mt-3 line-clamp-2 text-center text-xs text-slate-600 dark:text-slate-400">
              {activeImage.prompt}
            </p>

            {/* Studio Color & Finishing Adjustments */}
            <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <Sliders size={12} className="text-amber-500" />
                  <span>Canvas Color Grading (Baked into Export)</span>
                </span>
                {(brightness !== 100 || contrast !== 100 || saturation !== 100) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                    }}
                    className="text-[10px] font-bold text-amber-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <div className="mb-0.5 flex justify-between font-semibold text-slate-500">
                    <span>Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={140}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <div className="mb-0.5 flex justify-between font-semibold text-slate-500">
                    <span>Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={140}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <div className="mb-0.5 flex justify-between font-semibold text-slate-500">
                    <span>Saturation</span>
                    <span>{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={160}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-User & Per-Project Persistent Image History Gallery */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History size={16} className="text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Image History &amp; Project Media Vault ({filteredHistory.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Isolated to {currentUser?.displayName || 'your workspace'} · Organized by project, aspect ratio &amp; quality
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-bold dark:bg-slate-800">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'project', label: 'Active Project' },
                  { id: 'favorites', label: '★ Favorites' },
                  { id: 'edited', label: '✨ Edited' },
                ] as const
              ).map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setHistoryFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    historyFilter === tab.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search prompt, style, project..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No generated or edited images match this filter yet. Generate an image above to save it to your project history.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-xl border transition ${
                  activeImage.id === item.id
                    ? 'border-amber-400 bg-amber-500/5 ring-1 ring-amber-400/40'
                    : 'border-slate-200 bg-slate-50 hover:border-amber-400/60 dark:border-slate-800 dark:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onClick={() => {
                        setActiveImage(item);
                        setPrompt(item.prompt);
                        setAspectRatio(item.aspectRatio);
                        setQuality(item.quality);
                        setStylePreset(item.stylePreset);
                        onNotice(`Loaded "${item.title}" in canvas`);
                      }}
                      className="h-full w-full cursor-pointer object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                        {item.aspectRatio}
                      </span>
                      <span className="rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {item.quality}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleToggleFavorite(item)}
                      className={`absolute top-2 right-2 rounded-lg p-1.5 backdrop-blur-xs transition ${
                        item.isFavorite
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-950/70 text-slate-300 hover:text-amber-400'
                      }`}
                      title={item.isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Star size={12} fill={item.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="p-3">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {item.prompt}
                    </p>

                    {projects.length > 0 && (
                      <div className="mt-2">
                        <select
                          value={item.projectId ?? 1}
                          onChange={(e) =>
                            void handleAssignImageProject(item, Number(e.target.value) || 1)
                          }
                          className="w-full truncate rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              📁 {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 border-t border-slate-200/80 px-3 py-2 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveImage(item);
                      setUploadedEditSourceUrl(null);
                      setUploadedEditSourceName('');
                      setStudioMode('edit');
                      onNotice(`Ready to edit "${item.title}"`);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-amber-400/15 px-2 py-1 text-[10px] font-bold text-amber-600 transition hover:bg-amber-400/25 dark:text-amber-400"
                  >
                    <Wand2 size={11} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadFormattedImage(item)}
                    className="flex items-center gap-1 rounded-lg bg-slate-200/70 px-2 py-1 text-[10px] font-bold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download size={11} />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDeleteImage(item)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                    title="Delete from history"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function VoiceoverDubbingWorkspace({
  onNotice,
  onSendToVideoStudio,
  onSyncAudioScenesToVideoStudio,
  currentUser,
  activeProjectId,
}: {
  onNotice: (msg: string) => void;
  onSendToVideoStudio: (
    prompt: string,
    syncedPayload?: {
      title: string;
      masterAudioUrl?: string;
      scenes: VideoStudioSceneItem[];
    },
  ) => void;
  onSyncAudioScenesToVideoStudio?: (payload: {
    promptText: string;
    title: string;
    masterAudioUrl?: string;
    scenes: VideoStudioSceneItem[];
  }) => void;
  currentUser?: AppUserSession | null;
  activeProjectId?: number;
}) {
  const [storyTitle, setStoryTitle] = useState('Sher aur Cheenti · Multilingual Urdu & English Dialogue');
  const [globalVoiceLanguage, setGlobalVoiceLanguage] = useState<
    'urdu' | 'english' | 'roman_urdu' | 'bilingual'
  >('urdu');
  const [turns, setTurns] = useState<DialogueTurn[]>([
    {
      id: 't1',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      pitch: 0.78,
      englishLine: 'Who dares wake the King of the Jungle? Speak up, tiny creature!',
      urduLine: 'جنگل کے بادشاہ کو کس نے جگایا؟ بولو ننھی چونٹی!',
      romanUrduLine: 'Jungle ke badshah ko kis ne jagaya? Bolo nanhi cheenti!',
      spokenLanguage: 'urdu',
      cameraAngle: 'Close-Up Speaker A',
      durationSec: 4,
    },
    {
      id: 't2',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      pitch: 1.32,
      englishLine: 'Please forgive me, O Mighty Sher! Spare my life, and one day I will help you!',
      urduLine: 'مجھے معاف کر دیں جنگل کے بادشاہ! ایک دن میں آپ کے کام آؤں گی!',
      romanUrduLine: 'Mujhe maaf kar dein jungle ke badshah! Aik din main aap ke kaam aaon gi!',
      spokenLanguage: 'urdu',
      cameraAngle: 'Close-Up Speaker B',
      durationSec: 4,
    },
    {
      id: 't3',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      pitch: 0.75,
      englishLine: 'ROAAAR! Help! I am trapped in this hunter net! Can anyone hear me?',
      urduLine: 'مدد کرو! میں شکاری کے جال میں پھنس گیا ہوں! کیا کوئی سن رہا ہے؟',
      romanUrduLine: 'Madad karo! Main shikari ke jaal mein phans gaya hoon! Kya koi sun raha hai?',
      spokenLanguage: 'urdu',
      cameraAngle: 'Wide Action Shot',
      durationSec: 4,
    },
    {
      id: 't4',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      pitch: 1.3,
      englishLine: 'Hold on, my friend Sher! I will bite through these thick ropes right now!',
      urduLine: 'حوصلہ رکھو میرے دوست شیر! میں ابھی اپنے دانتوں سے یہ رسیاں کاٹتی ہوں!',
      romanUrduLine: 'Hosla rakho mere dost Sher! Main abhi apne daanton se yeh rassiyan kaatti hoon!',
      spokenLanguage: 'urdu',
      cameraAngle: 'Extreme Macro Shot',
      durationSec: 4,
    },
    {
      id: 't5',
      speaker: 'Sher & Cheenti',
      voice: 'Puck',
      pitch: 0.9,
      englishLine: 'Thank you, brave little Cheenti! No friend is ever too small to save a king!',
      urduLine: 'شکریہ ننھی چونٹی! سچا دوست کبھی چھوٹا نہیں ہوتا!',
      romanUrduLine: 'Shukriya nanhi Cheenti! Sacha dost kabhi chota nahi hota!',
      spokenLanguage: 'english',
      cameraAngle: 'Two-Shot Finale',
      durationSec: 4,
    },
  ]);
  const [masterWavUrl, setMasterWavUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [synthesizingTurnId, setSynthesizingTurnId] = useState<string | null>(null);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [liveMouthOpenPct, setLiveMouthOpenPct] = useState<number>(0);
  const [vaultClips, setVaultClips] = useState<SavedAudioVaultClip[]>([]);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeEnvelopeRef = useRef<number[]>([]);

  const loadAudioVaultClips = async () => {
    try {
      const authHeaders = await buildUserAuthHeaders(currentUser || null);
      const query =
        typeof activeProjectId === 'number' ? `?projectId=${encodeURIComponent(activeProjectId)}` : '';
      const res = await fetch(`/api/audio-library${query}`, { headers: authHeaders });
      const data = (res.ok ? await res.json() : null) as { clips?: SavedAudioVaultClip[] } | null;
      if (data?.clips) {
        setVaultClips(data.clips);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadAudioVaultClips();
  }, [currentUser?.uid, activeProjectId]);

  // Real-time lip-sync mouth monitor loop driven by <audio> currentTime + 30fps PCM envelope
  useEffect(() => {
    let animId = 0;
    const tick = () => {
      const audioEl = previewAudioRef.current;
      if (audioEl && !audioEl.paused && !audioEl.ended) {
        const env = activeEnvelopeRef.current;
        if (env.length > 0) {
          const frameIdx = Math.min(
            env.length - 1,
            Math.max(0, Math.floor(audioEl.currentTime * 30)),
          );
          setLiveMouthOpenPct(Math.round((env[frameIdx] || 0) * 100));
        } else {
          const fallbackPulse = Math.abs(Math.sin(performance.now() * 0.018)) * 75;
          setLiveMouthOpenPct(Math.round(fallbackPulse));
        }
      } else if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        const pulse = Math.abs(Math.sin(performance.now() * 0.016) * Math.cos(performance.now() * 0.011)) * 82;
        setLiveMouthOpenPct(Math.round(pulse));
      } else {
        setLiveMouthOpenPct(0);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Translate & Transliterate all dialogue turns across English, Urdu (اردو), and Roman Urdu
  const handleTranslateAllTurns = async () => {
    if (isTranslating || turns.length === 0) return;
    setIsTranslating(true);
    onNotice('Translating & syncing Urdu (اردو), Roman Urdu, and English dialogue...');
    try {
      const authHeaders = await buildUserAuthHeaders(currentUser || null);
      const res = await fetch('/api/tts/translate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          items: turns.map((t) => ({
            speakerName: t.speaker,
            english: t.englishLine,
            urdu: t.urduLine,
            romanUrdu: t.romanUrduLine || '',
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        items?: Array<{ english?: string; urdu?: string; romanUrdu?: string }>;
        error?: string;
      };
      if (!res.ok || !Array.isArray(data.items)) {
        throw new Error(data.error || 'Translation failed');
      }
      setTurns((prev) =>
        prev.map((t, idx) => {
          const tr = data.items?.[idx];
          if (!tr) return t;
          return {
            ...t,
            englishLine: tr.english || t.englishLine,
            urduLine: tr.urdu || t.urduLine,
            romanUrduLine: tr.romanUrdu || t.romanUrduLine,
          };
        }),
      );
      onNotice('Synced English, Urdu Nastaliq (اردو), and Roman Urdu across all dialogue turns!');
    } catch (err) {
      onNotice(err instanceof Error ? err.message : 'Dialogue translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Synthesize or Retry a single turn's voice via Gemini TTS + store safely in Audio Vault & Firestore
  const synthesizeSingleTurn = async (turnIdx: number) => {
    const turn = turns[turnIdx];
    if (!turn) return;
    setSynthesizingTurnId(turn.id);
    const lang = turn.spokenLanguage || globalVoiceLanguage;
    onNotice(`Synthesizing ${turn.speaker} (${turn.voice} · ${lang.toUpperCase()}) neural voice...`);

    try {
      const authHeaders = await buildUserAuthHeaders(currentUser || null);
      const res = await fetch('/api/video/scene-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          title: `${storyTitle} · Turn ${turnIdx + 1} (${turn.speaker})`,
          speakerName: turn.speaker,
          voiceName: turn.voice,
          speakerPitch: turn.pitch,
          dialogueLine: turn.englishLine,
          dialogueUrdu: turn.urduLine,
          dialogueRomanUrdu: turn.romanUrduLine || '',
          language: lang,
          durationSec: turn.durationSec || 4,
          sceneIdx: turnIdx,
          projectId: activeProjectId ?? 1,
          includeSfx: false,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        clipId?: string;
        audioUrl?: string;
        audioDataUrl?: string;
        durationSec?: number;
        lipSyncEnvelope?: number[];
        spokenText?: string;
        error?: string;
      };
      if (!res.ok || (!data.audioUrl && !data.audioDataUrl)) {
        throw new Error(data.error || `Failed to synthesize Turn ${turnIdx + 1}`);
      }

      const audioSrc = data.audioUrl || data.audioDataUrl!;
      const env = data.lipSyncEnvelope || [];

      setTurns((prev) =>
        prev.map((item, i) =>
          i === turnIdx
            ? {
                ...item,
                spokenLanguage: lang,
                audioUrl: data.audioUrl,
                audioDataUrl: data.audioDataUrl || data.audioUrl,
                durationSec: data.durationSec || item.durationSec || 4,
                lipSyncEnvelope: env,
                synthError: undefined,
              }
            : item,
        ),
      );

      if (currentUser?.uid && data.clipId) {
        void saveUserArtifactToFirestore(currentUser.uid, {
          id: data.clipId,
          kind: 'audio',
          title: `${turn.speaker} (${lang.toUpperCase()}): ${(data.spokenText || turn.englishLine).slice(0, 60)}`,
          description: data.spokenText || turn.englishLine,
          createdAt: new Date().toISOString(),
        });
      }

      activeEnvelopeRef.current = env;
      setActiveSpeakingId(turn.id);
      if (previewAudioRef.current) {
        previewAudioRef.current.src = audioSrc;
        previewAudioRef.current.currentTime = 0;
        previewAudioRef.current.onended = () => setActiveSpeakingId(null);
        void previewAudioRef.current.play().catch(() => {});
      }

      void loadAudioVaultClips();
      onNotice(
        `Synthesized & stored ${turn.speaker} (${lang.toUpperCase()}) with ${env.length} PCM lip-sync frames`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Voice synthesis failed';
      setTurns((prev) =>
        prev.map((item, i) => (i === turnIdx ? { ...item, synthError: msg } : item)),
      );
      onNotice(msg);
    } finally {
      setSynthesizingTurnId(null);
    }
  };

  const synthesizeMasterTrack = async () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    onNotice(`Synthesizing multi-character ${globalVoiceLanguage.toUpperCase()} voices & master lip-sync track...`);
    try {
      const authHeaders = await buildUserAuthHeaders(currentUser || null);
      const scenesPayload = turns.map((t, i) => ({
        headline: `Scene ${i + 1} · ${t.speaker}`,
        subtext: t.englishLine,
        dialogueLine: t.englishLine,
        dialogueUrdu: t.urduLine,
        dialogueRomanUrdu: t.romanUrduLine || '',
        spokenLanguage: t.spokenLanguage || globalVoiceLanguage,
        speakerName: t.speaker,
        speakerVoice: t.voice,
        speakerPitch: t.pitch,
        durationSec: t.durationSec || 4,
        sfxMood: 'Cinematic Forest & Story Ambience',
      }));
      const res = await fetch('/api/video/dialogue-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ scenes: scenesPayload }),
      });
      const data = (await res.json()) as {
        masterAudioUrl?: string;
        sceneAudioUrls?: Array<string | null>;
        sceneLipSyncEnvelopes?: number[][];
        sceneDurations?: number[];
        error?: string;
      };
      if (!res.ok || !data?.masterAudioUrl) {
        throw new Error(data?.error || 'Failed to synthesize master audio track');
      }
      setMasterWavUrl(data.masterAudioUrl);
      setTurns((prev) =>
        prev.map((t, i) => ({
          ...t,
          audioUrl: data.sceneAudioUrls?.[i] || t.audioUrl,
          audioDataUrl: data.sceneAudioUrls?.[i] || t.audioDataUrl,
          lipSyncEnvelope: data.sceneLipSyncEnvelopes?.[i] || t.lipSyncEnvelope,
          durationSec: data.sceneDurations?.[i] || t.durationSec || 4,
          synthError: undefined,
        })),
      );
      void loadAudioVaultClips();
      onNotice('Multi-character master WAV audio track & per-scene lip-sync envelopes ready!');
    } catch (err) {
      onNotice(err instanceof Error ? err.message : 'Master track synthesis failed');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const speakSingleTurn = (turn: DialogueTurn) => {
    setActiveSpeakingId(turn.id);
    const audioSrc = turn.audioUrl || turn.audioDataUrl;
    if (audioSrc && previewAudioRef.current) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      activeEnvelopeRef.current = turn.lipSyncEnvelope || [];
      previewAudioRef.current.src = audioSrc;
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current.onended = () => setActiveSpeakingId(null);
      void previewAudioRef.current.play().catch(() => {});
      onNotice(`Playing stored neural voice for ${turn.speaker} (${(turn.spokenLanguage || globalVoiceLanguage).toUpperCase()})`);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const lang = turn.spokenLanguage || globalVoiceLanguage;
      const textToSpeak =
        lang === 'urdu'
          ? turn.urduLine || turn.englishLine
          : lang === 'roman_urdu'
            ? turn.romanUrduLine || turn.englishLine
            : turn.englishLine;
      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.lang = lang === 'urdu' || lang === 'roman_urdu' ? 'ur-PK' : 'en-US';
      u.pitch = turn.pitch;
      u.rate = 0.96;
      u.onend = () => setActiveSpeakingId(null);
      window.speechSynthesis.speak(u);
    }
    onNotice(`Previewing ${turn.speaker} (${turn.voice} · ${(turn.spokenLanguage || globalVoiceLanguage).toUpperCase()})`);
  };

  const buildVideoStudioScenesFromTurns = (): VideoStudioSceneItem[] => {
    return turns.map((t, i) => ({
      headline: `Scene ${i + 1} · ${t.speaker}`,
      subtext: t.englishLine,
      bgGradient: (i % 2 === 0 ? ['#064E3B', '#0F172A'] : ['#1E1B4B', '#090D16']) as [string, string],
      accentColor: i % 2 === 0 ? '#F59E0B' : '#10B981',
      durationSec: t.durationSec || 4,
      motionStyle: 'zoom',
      cameraMove: t.cameraAngle || 'Close-Up Dialogue Shot',
      cameraShotType: i % 2 === 0 ? 'close_up_a' : 'close_up_b',
      speakerName: t.speaker,
      speakerVoice: t.voice,
      speakerPitch: t.pitch,
      dialogueLine: t.englishLine,
      dialogueUrdu: t.urduLine,
      dialogueRomanUrdu: t.romanUrduLine || '',
      spokenLanguage: t.spokenLanguage || globalVoiceLanguage,
      audioDataUrl: t.audioUrl || t.audioDataUrl,
      lipSyncEnvelope: t.lipSyncEnvelope,
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 overflow-y-auto p-4 sm:p-6">
      <audio ref={previewAudioRef} className="hidden" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
              Multilingual Urdu &amp; English Voiceover, Dubbing &amp; Lip-Sync Studio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Google Gemini TTS Neural Voices (Fenrir, Kore, Puck, Charon, Zephyr) · Urdu Nastaliq (اردو), Roman Urdu &amp; English · Real PCM Lip-Sync &amp; Safe Audio Vault
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isTranslating}
              onClick={() => void handleTranslateAllTurns()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-amber-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <RefreshCw size={13} className={isTranslating ? 'animate-spin' : ''} />
              <span>{isTranslating ? 'Translating...' : 'AI Sync Urdu (اردو) ↔ English'}</span>
            </button>

            <button
              type="button"
              disabled={isSynthesizing}
              onClick={() => void synthesizeMasterTrack()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              <AudioWaveform size={14} />
              <span>
                {isSynthesizing
                  ? 'Synthesizing Voices...'
                  : `Synthesize Master (${globalVoiceLanguage.toUpperCase()})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const syncedScenes = buildVideoStudioScenesFromTurns();
                const fullPrompt = `Create a 3D Pixar animated video for "${storyTitle}" with ${globalVoiceLanguage.toUpperCase()} character voices and lip-sync: ${turns
                  .map((t, i) => `Scene ${i + 1} (${t.speaker}): "${t.englishLine}"`)
                  .join(' -> ')}`;
                if (onSyncAudioScenesToVideoStudio) {
                  onSyncAudioScenesToVideoStudio({
                    promptText: fullPrompt,
                    title: storyTitle,
                    masterAudioUrl: masterWavUrl || undefined,
                    scenes: syncedScenes,
                  });
                } else {
                  onSendToVideoStudio(fullPrompt, {
                    title: storyTitle,
                    masterAudioUrl: masterWavUrl || undefined,
                    scenes: syncedScenes,
                  });
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 transition hover:bg-slate-800 dark:bg-slate-800"
            >
              <Film size={14} />
              <span>Connect Audio &amp; Scenes to Video Studio</span>
            </button>
          </div>
        </div>

        {/* Global Language Selector + Live Mouth Lip-Sync Monitor */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Spoken Language Pipeline:
            </span>
            {(
              [
                { id: 'urdu', label: '🇵🇰 Urdu (اردو)' },
                { id: 'english', label: '🇬🇧 English' },
                { id: 'roman_urdu', label: '🔤 Roman Urdu' },
                { id: 'bilingual', label: '🌐 Bilingual (Urdu + EN)' },
              ] as const
            ).map((langOpt) => (
              <button
                key={langOpt.id}
                type="button"
                onClick={() => {
                  setGlobalVoiceLanguage(langOpt.id);
                  setTurns((prev) => prev.map((t) => ({ ...t, spokenLanguage: langOpt.id })));
                  onNotice(`Set voiceover pipeline language to ${langOpt.label}`);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  globalVoiceLanguage === langOpt.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {langOpt.label}
              </button>
            ))}
          </div>

          {/* Live Lip-Sync Mouth Articulation Preview Widget */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-900 px-3.5 py-1.5 text-white dark:border-slate-700">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/50 bg-slate-800">
              {/* Animated Mouth SVG driven by liveMouthOpenPct */}
              <div
                style={{
                  width: `${Math.max(10, 14 + liveMouthOpenPct * 0.08)}px`,
                  height: `${Math.max(3, 3 + liveMouthOpenPct * 0.16)}px`,
                }}
                className="rounded-full border-2 border-rose-400 bg-rose-950 transition-all duration-75"
              />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-amber-400">
                LIVE LIP-SYNC MONITOR
              </div>
              <div className="font-mono text-[11px] text-emerald-400">
                Mouth Open: {liveMouthOpenPct}% {activeSpeakingId ? '· Speaking' : '· Silent'}
              </div>
            </div>
          </div>
        </div>

        {masterWavUrl && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-emerald-400/50 bg-emerald-50/50 p-3.5 sm:flex-row dark:bg-emerald-950/20">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Mastered Multi-Character ({globalVoiceLanguage.toUpperCase()}) Dialogue + SFX Track
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <audio controls src={masterWavUrl} className="h-9 flex-1 sm:w-64" />
              <a
                href={masterWavUrl}
                download="saz-multilingual-dialogue.wav"
                className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-extrabold text-slate-950"
              >
                <Download size={13} />
                <span>WAV</span>
              </a>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {turns.map((turn, idx) => {
            const turnAudioSrc = turn.audioUrl || turn.audioDataUrl;
            const isTurnLoading = synthesizingTurnId === turn.id;
            return (
              <div
                key={turn.id}
                className={`rounded-xl border p-4 transition ${
                  activeSpeakingId === turn.id
                    ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      0{idx + 1}.
                    </span>
                    <input
                      value={turn.speaker}
                      onChange={(e) =>
                        setTurns((prev) =>
                          prev.map((item) =>
                            item.id === turn.id ? { ...item, speaker: e.target.value } : item,
                          ),
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <select
                      value={turn.voice}
                      onChange={(e) =>
                        setTurns((prev) =>
                          prev.map((item) =>
                            item.id === turn.id
                              ? { ...item, voice: e.target.value as DialogueTurn['voice'] }
                              : item,
                          ),
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="Fenrir">Fenrir (Deep Royal Male)</option>
                      <option value="Kore">Kore (Expressive Bright)</option>
                      <option value="Puck">Puck (Clever Storyteller)</option>
                      <option value="Zephyr">Zephyr (Heroic Energetic)</option>
                      <option value="Charon">Charon (Cinematic Bass)</option>
                    </select>

                    <select
                      value={turn.spokenLanguage || globalVoiceLanguage}
                      onChange={(e) => {
                        const lang = e.target.value as NonNullable<DialogueTurn['spokenLanguage']>;
                        setTurns((prev) =>
                          prev.map((item) =>
                            item.id === turn.id ? { ...item, spokenLanguage: lang } : item,
                          ),
                        );
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300"
                    >
                      <option value="urdu">🇵🇰 Speak Urdu (اردو)</option>
                      <option value="english">🇬🇧 Speak English</option>
                      <option value="roman_urdu">🔤 Speak Roman Urdu</option>
                      <option value="bilingual">🌐 Bilingual (Urdu + EN)</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isTurnLoading}
                      onClick={() => void synthesizeSingleTurn(idx)}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-800"
                    >
                      <Mic size={12} />
                      <span>
                        {isTurnLoading
                          ? 'Synthesizing...'
                          : turn.synthError
                            ? '↻ Retry TTS'
                            : turnAudioSrc
                              ? '↻ Re-Synthesize WAV'
                              : 'Synthesize Neural WAV'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => speakSingleTurn(turn)}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                    >
                      <Volume2 size={13} />
                      <span>Preview Voice &amp; Lip-Sync</span>
                    </button>
                  </div>
                </div>

                {turn.synthError && (
                  <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-500">
                    {turn.synthError}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                      🇬🇧 English Dialogue
                    </label>
                    <input
                      value={turn.englishLine}
                      onChange={(e) =>
                        setTurns((prev) =>
                          prev.map((item) =>
                            item.id === turn.id ? { ...item, englishLine: e.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      🇵🇰 Urdu Script (اردو مکالمہ)
                    </label>
                    <input
                      dir="auto"
                      value={turn.urduLine}
                      onChange={(e) =>
                        setTurns((prev) =>
                          prev.map((item) =>
                            item.id === turn.id ? { ...item, urduLine: e.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                      🔤 Roman Urdu Phonetic
                    </label>
                    <input
                      value={turn.romanUrduLine || ''}
                      onChange={(e) =>
                        setTurns((prev) =>
                          prev.map((item) =>
                            item.id === turn.id
                              ? { ...item, romanUrduLine: e.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                </div>

                {turnAudioSrc && (
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      ✓ Stored WAV ({turn.durationSec || 4}s · {turn.lipSyncEnvelope?.length || 0} Lip-Sync Frames)
                    </span>
                    <div className="flex items-center gap-2">
                      <audio controls src={turnAudioSrc} className="h-7 w-48" />
                      <a
                        href={turnAudioSrc.startsWith('/api/') ? `${turnAudioSrc}?download=1` : turnAudioSrc}
                        download={`turn-${idx + 1}-${turn.voice}.wav`}
                        className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-slate-950"
                      >
                        Download WAV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Safe Audio Vault Library */}
        {vaultClips.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                🔒 Safe Audio Vault ({vaultClips.length} Persisted Multilingual Clips)
              </h3>
              <button
                type="button"
                onClick={() => void loadAudioVaultClips()}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400"
              >
                Refresh Vault
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vaultClips.slice(0, 8).map((clip) => (
                <div
                  key={clip.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {clip.speakerName} ({clip.voiceName} · {clip.language.toUpperCase()})
                    </div>
                    <div dir="auto" className="truncate text-[11px] text-slate-500">
                      {clip.dialogueText}
                    </div>
                  </div>
                  <audio controls src={clip.audioUrl} className="h-7 w-32 shrink-0" />
                  <button
                    type="button"
                    onClick={async () => {
                      const authHeaders = await buildUserAuthHeaders(currentUser || null);
                      await fetch(`/api/audio-library/${encodeURIComponent(clip.id)}`, {
                        method: 'DELETE',
                        headers: authHeaders,
                      });
                      void loadAudioVaultClips();
                    }}
                    className="rounded p-1 text-slate-400 hover:text-rose-500"
                    title="Delete Audio Clip"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MusicSfxWorkspace({ onNotice }: { onNotice: (msg: string) => void }) {
  const [selectedPreset, setSelectedPreset] = useState('Jungle Morning Birds & Flute');
  const [tempoBpm, setTempoBpm] = useState(108);
  const [durationSec, setDurationSec] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const presets = [
    {
      name: 'Jungle Morning Birds & Flute',
      desc: 'Warm banyan forest birdsong, gentle breeze & acoustic woodwind melody',
      notes: [261.63, 329.63, 392.0, 523.25, 659.25],
      wave: 'sine' as OscillatorType,
    },
    {
      name: 'Lion Roar & Dramatic Drums',
      desc: 'Deep low-end sub-bass rumble, tribal percussion & suspenseful brass',
      notes: [110.0, 130.81, 146.83, 164.81, 98.0],
      wave: 'sawtooth' as OscillatorType,
    },
    {
      name: 'Triumphant Pixar Finale Swell',
      desc: 'Uplifting major-key orchestral strings, celesta sparkles & warm horns',
      notes: [293.66, 369.99, 440.0, 587.33, 739.99],
      wave: 'triangle' as OscillatorType,
    },
    {
      name: '3D Turbo Arcade Synthwave',
      desc: 'High-octane 128 BPM arpeggiated bassline for 3D racing & action games',
      notes: [220.0, 277.18, 329.63, 440.0, 329.63],
      wave: 'square' as OscillatorType,
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;
    const render = (now: number) => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, W, H);
      const bars = 36;
      const barW = (W - 40) / bars;
      for (let i = 0; i < bars; i++) {
        const amp = isPlaying
          ? Math.abs(Math.sin(now * 0.008 + i * 0.35) * Math.cos(now * 0.004 - i * 0.2))
          : 0.12;
        const bh = Math.max(6, amp * (H - 36));
        ctx.fillStyle = i % 2 === 0 ? '#F59E0B' : '#38BDF8';
        ctx.fillRect(20 + i * barW, H / 2 - bh / 2, barW - 4, bh);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const playSynthesizedScore = () => {
    const preset = presets.find((p) => p.name === selectedPreset) || presets[0];
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ac;
      if (ac.state === 'suspended') void ac.resume();

      setIsPlaying(true);
      const beatSec = 60 / tempoBpm;
      const totalSteps = Math.max(8, Math.floor(durationSec / (beatSec * 0.5)));

      for (let step = 0; step < totalSteps; step++) {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const freq = preset.notes[step % preset.notes.length];
        osc.type = preset.wave;
        const startT = ac.currentTime + step * beatSec * 0.5;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.exponentialRampToValueAtTime(0.05, startT + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + beatSec * 0.9);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(startT);
        osc.stop(startT + beatSec);
      }

      window.setTimeout(() => setIsPlaying(false), durationSec * 1000);
      onNotice(`Playing "${preset.name}" at ${tempoBpm} BPM`);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
              AI Music & Atmospheric SFX Generator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Procedural Background Scores, Forest Foley, Lion Roars & Orchestral Stems
            </p>
          </div>
          <button
            type="button"
            onClick={playSynthesizedScore}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300"
          >
            <Play size={14} />
            <span>{isPlaying ? 'Playing Studio Stem...' : 'Play Score & SFX'}</span>
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={760}
          height={140}
          className="mt-4 h-32 w-full rounded-2xl border border-slate-800 bg-slate-950 object-cover"
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {presets.map((p) => (
            <button
              type="button"
              key={p.name}
              onClick={() => {
                setSelectedPreset(p.name);
                onNotice(`Selected "${p.name}"`);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                selectedPreset === p.name
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/25'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</span>
                <Music size={15} className="text-amber-500" />
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{p.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Tempo: {tempoBpm} BPM
            </label>
            <input
              type="range"
              min={72}
              max={160}
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              className="mt-2 w-full accent-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Stem Length: {durationSec} Seconds
            </label>
            <input
              type="range"
              min={4}
              max={20}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="mt-2 w-full accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoryGeneratorWorkspace({
  onNotice,
  onAnimateStory,
}: {
  onNotice: (msg: string) => void;
  onAnimateStory: (prompt: string) => void;
}) {
  const [storyIdea, setStoryIdea] = useState(
    'Sher aur Cheenti (The Lion and the Ant) moral fable in Disney/Pixar 3D style with Urdu/Hindi dialogues',
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [scenes, setScenes] = useState<StorySceneDraft[]>([
    {
      sceneNumber: 1,
      headline: 'Scene 1 · Lion & Ant Under the Banyan Tree',
      cameraAngle: 'Close-Up Speaker A · 3D Push-In',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      dialogueEnglish: 'Who dares wake the King of the Jungle? Speak up, tiny creature!',
      dialogueUrdu: 'جنگل کے بادشاہ کو کس نے جگایا؟ بولو ننھی چونٹی!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 portrait: majestic golden-maned 3D lion resting under a sunlit jungle tree while a tiny red-brown 3D ant stands on his paw.',
      sfxMood: 'Jungle Morning Birds & Deep Lion Breath',
    },
    {
      sceneNumber: 2,
      headline: 'Scene 2 · The Ant’s Promise',
      cameraAngle: 'Close-Up Speaker B · Eye-Level Reverse',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      dialogueEnglish: 'Please forgive me, O Mighty Sher! Spare my life, and one day I will surely help you!',
      dialogueUrdu: 'مجھے معاف کر دیں جنگل کے بادشاہ! ایک دن میں آپ کے کام آؤں گی!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 close-up: kind 3D lion smiling warmly at the brave tiny 3D ant pleading on a glowing emerald leaf.',
      sfxMood: 'Heartwarming Flute & Forest Breeze',
    },
    {
      sceneNumber: 3,
      headline: 'Scene 3 · The Hunter’s Net Trap',
      cameraAngle: 'Wide Action Shot · Low-Angle Shake',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      dialogueEnglish: 'ROAAAR! Help! I am trapped in this hunter net! Can anyone in the forest hear me?',
      dialogueUrdu: 'مدد کرو! میں شکاری کے جال میں پھنس گیا ہوں!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 shot: majestic 3D lion tangled inside a heavy woven rope hunter net in the twilight forest.',
      sfxMood: 'Echoing Lion Roar & Rustling Ropes',
    },
    {
      sceneNumber: 4,
      headline: 'Scene 4 · Cheenti Cuts the Ropes',
      cameraAngle: 'Extreme Macro Shot · Rope Cutting',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      dialogueEnglish: 'Hold on, my friend Sher! I will bite through these thick ropes and set you free!',
      dialogueUrdu: 'حوصلہ رکھو میرے دوست شیر! میں ابھی اپنے دانتوں سے یہ رسیاں کاٹتی ہوں!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 macro shot: brave tiny 3D ant heroically biting through thick frayed hunter rope strands.',
      sfxMood: 'Snapping Rope Fibers & Heroic Strings',
    },
    {
      sceneNumber: 5,
      headline: 'Scene 5 · Royal Friendship Finale',
      cameraAngle: 'Two-Shot Finale · Crane Pull-Back',
      speaker: 'Sher & Cheenti',
      voice: 'Fenrir',
      dialogueEnglish: 'Thank you, brave little Cheenti! Truly, no friend is ever too small to save a king!',
      dialogueUrdu: 'شکریہ ننھی چونٹی! سچا دوست کبھی چھوٹا نہیں ہوتا!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 finale: freed joyful 3D lion and tiny heroic ant celebrating on a sunlit jungle rock with golden fireflies.',
      sfxMood: 'Triumphant Orchestral Finale Swell',
    },
  ]);

  const loadTemplate = (template: 'sher' | 'fox' | 'veggie') => {
    if (template === 'sher') {
      setStoryIdea('Sher aur Cheenti (The Lion and the Ant) moral fable in Disney/Pixar 3D style');
      onNotice('Loaded Sher aur Cheenti 5-Scene Script');
      return;
    }
    if (template === 'fox') {
      setStoryIdea('Lomri aur Murgha (Clever Fox & Rooster) 3D Pixar Forest Fable');
      setScenes([
        {
          sceneNumber: 1,
          headline: 'Scene 1 · Morning in Emerald Woods',
          cameraAngle: 'Wide Two-Shot · Low-Angle Crane Push',
          speaker: 'Lomri (The Fox)',
          voice: 'Puck',
          dialogueEnglish: 'Good morning, handsome Rooster! What a glorious golden crown you have today!',
          dialogueUrdu: 'صبح بخیر پیارے مرغے! آج تمہاری شاندار کلغی کتنی چمک رہی ہے!',
          visualPrompt3D:
            'Disney Pixar 3D CGI vertical 9:16: expressive orange fox looking up at a vibrant feathered rooster on an oak branch.',
          sfxMood: 'Forest Morning Birds & Rustling Leaves',
        },
        {
          sceneNumber: 2,
          headline: 'Scene 2 · The Flattery Dialogue',
          cameraAngle: 'Close-Up Speaker A · Fox Dialogue',
          speaker: 'Lomri (The Fox)',
          voice: 'Puck',
          dialogueEnglish: 'Sing your royal melody with your eyes closed so the whole forest can rejoice!',
          dialogueUrdu: 'ذرا آنکھیں بند کر کے اپنی سریلی آواز میں گیت تو سناؤ!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 close-up: charismatic fox bowing playfully with sparkling eyes.',
          sfxMood: 'Playful Pizzicato Strings',
        },
        {
          sceneNumber: 3,
          headline: 'Scene 3 · Spotting the Trick',
          cameraAngle: 'Over-Shoulder Shot · Suspenseful Tilt',
          speaker: 'Murgha (The Rooster)',
          voice: 'Zephyr',
          dialogueEnglish: 'Aha! I see your sneaky paws waiting below, Mr. Fox! You will not trick me!',
          dialogueUrdu: 'اہا! میں تمہاری چال سمجھ گیا ہوں چالاک لومڑی!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 shot: sneaky fox crouching below the branch while the smart rooster spots the trick.',
          sfxMood: 'Suspenseful Woodwinds',
        },
        {
          sceneNumber: 4,
          headline: 'Scene 4 · Ringing the Forest Bell',
          cameraAngle: 'Close-Up Speaker B · Rooster Hero Shot',
          speaker: 'Murgha (The Rooster)',
          voice: 'Zephyr',
          dialogueEnglish: 'Cock-a-doodle-doo! Look, the village hounds are coming right behind you!',
          dialogueUrdu: 'ککڑوں کوں! دیکھو گاؤں کے محافظ تمہارے پیچھے آ رہے ہیں!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 action shot: clever rooster ringing a vine bell in bright sunbeams.',
          sfxMood: 'Echoing Bell Chime & Whoosh',
        },
        {
          sceneNumber: 5,
          headline: 'Scene 5 · Wisdom Wins',
          cameraAngle: 'Wide Action Shot · Crane Pull-Back',
          speaker: 'Lomri & Murgha',
          voice: 'Puck',
          dialogueEnglish: 'Oh no, I must run! Wisdom and alertness always triumph over flattery!',
          dialogueUrdu: 'عقل مندی اور ہوشیاری ہمیشہ خوشامد سے جیت جاتی ہے!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 finale: joyful rooster crowing proudly on sunlit treetop as fox sprints away.',
          sfxMood: 'Triumphant Orchestral Swell',
        },
      ]);
      onNotice('Loaded Clever Fox & Rooster 5-Scene Script');
    } else {
      setStoryIdea('Vegetable Village Heroes · 3D Pixar Adventure');
      onNotice('Loaded Vegetable Village 5-Scene Script');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
              3D Story Scriptwriter, Scene Breakdown & Prompt Builder
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              5-Scene 9:16 Screenplay with Camera Angles, Character Voices, Urdu/Hindi Subtitles & 3D Prompts
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onAnimateStory(
                `Create a 3D Disney/Pixar animated story for "${storyIdea}" in 9:16 vertical format with 5 sequential scenes (${scenes
                  .map((s) => `${s.headline}: ${s.dialogueEnglish}`)
                  .join(' -> ')}), multi-character voiceover, lip-sync, SFX, and Urdu subtitles.`,
              )
            }
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300"
          >
            <Film size={14} />
            <span>Produce 5-Scene 3D Video Now</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Story Templates:</span>
          <button
            type="button"
            onClick={() => loadTemplate('sher')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            🦁 Sher aur Cheenti (Lion & Ant)
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('fox')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            🦊 Clever Fox & Rooster
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('veggie')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            🥕 Vegetable Village
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {scenes.map((scene, idx) => (
            <div
              key={scene.sceneNumber}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    0{scene.sceneNumber}.
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {scene.headline}
                  </span>
                  <span className="text-xs text-slate-500">
                    · {scene.speaker} ({scene.voice}) · {scene.cameraAngle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(scene.visualPrompt3D);
                    setCopiedIdx(idx);
                    window.setTimeout(() => setCopiedIdx(null), 1200);
                    onNotice(`Copied Scene ${scene.sceneNumber} 3D Prompt`);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy 3D Prompt'}</span>
                </button>
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                “{scene.dialogueEnglish}”
              </p>
              <p dir="auto" className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                {scene.dialogueUrdu}
              </p>
              <div className="mt-2 rounded-lg bg-white p-2.5 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-amber-400">3D Visual Prompt: </strong>
                {scene.visualPrompt3D}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface VideoStudioCharacter {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  visualDescription: string;
  voiceName: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  pitch: number;
  accentColor: string;
}

export interface VideoStudioSceneItem {
  headline: string;
  subtext: string;
  bgGradient: [string, string];
  accentColor: string;
  durationSec: number;
  motionStyle: 'zoom' | 'pan' | 'pulse' | 'kinetic';
  imageUrl?: string;
  visualPrompt3D?: string;
  characterType?: 'lion_ant' | 'fox_rooster' | 'veggie_village' | 'forest_friends' | 'hero_adventure';
  cameraMove?: string;
  cameraShotType?: 'close_up_a' | 'close_up_b' | 'wide_action' | 'over_shoulder' | 'macro_action';
  lightingMood?: string;
  sfxMood?: string;
  characterId?: string;
  speakerName?: string;
  speakerVoice?: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  speakerPitch?: number;
  dialogueLine?: string;
  dialogueUrdu?: string;
  dialogueRomanUrdu?: string;
  spokenLanguage?: 'urdu' | 'english' | 'roman_urdu' | 'bilingual';
  facialExpression?: string;
  mouthRegion?: { x: number; y: number; radius: number };
  audioDataUrl?: string;
  audioUrl?: string;
  audioClipId?: string;
  lipSyncEnvelope?: number[];
  synthError?: string;
}

export interface VideoProductionBridgeAsset {
  id: string;
  studio: 'ImageStudio' | 'VideoStudio' | 'AudioStudio';
  type: 'image' | 'video' | 'audio';
  title: string;
  prompt: string;
  url?: string;
  masterAudioUrl?: string;
  videoOperationName?: string;
  videoEngine?: string;
  aspectRatio?: string;
  resolution?: string;
  voiceName?: string;
  audioScript?: string;
  durationSec?: number;
  scenes?: VideoStudioSceneItem[];
  socialCaption?: string;
  socialHashtags?: string[];
}

type PipelineStageId =
  | 'prompt'
  | 'script'
  | 'characters'
  | 'scenes'
  | 'dialogue'
  | 'voice'
  | 'stage3d'
  | 'generate'
  | 'final';

type StepRunStatus = 'idle' | 'running' | 'completed' | 'error' | 'cancelled';

interface SavedVideoProductionItem {
  id: string;
  title: string;
  prompt: string;
  logline: string;
  narrativeScript: string;
  visualStyle: string;
  aspectRatio: '9:16' | '16:9';
  language: string;
  characters: VideoStudioCharacter[];
  scenes: VideoStudioSceneItem[];
  masterAudioUrl?: string;
  videoOperationName?: string;
  compiledVideoUrl?: string;
  status: 'draft' | 'script_ready' | 'scenes_ready' | 'voiced' | 'completed';
  updatedAt: string;
}

const VOICE_OPTIONS: Array<{
  id: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  label: string;
  timbre: string;
  defaultPitch: number;
}> = [
  { id: 'Fenrir', label: 'Fenrir', timbre: 'Deep Royal Baritone', defaultPitch: 0.82 },
  { id: 'Kore', label: 'Kore', timbre: 'Warm Expressive Lead', defaultPitch: 1.24 },
  { id: 'Puck', label: 'Puck', timbre: 'Bright Energetic Youth', defaultPitch: 1.18 },
  { id: 'Charon', label: 'Charon', timbre: 'Clever Storyteller', defaultPitch: 0.9 },
  { id: 'Zephyr', label: 'Zephyr', timbre: 'Smooth Cinematic Lyric', defaultPitch: 1.05 },
];

export interface VideoStudioProductionWorkspaceProps {
  onNotice?: (text: string) => void;
  currentUser?: AppUserSession | null;
  activeProjectId?: number | null;
  onOpenInCanvas?: (title: string, htmlCode: string) => void;
  initialPrompt?: string;
  onSendToChat?: (promptText: string) => void;
}

export function VideoStudioProductionWorkspace({
  onNotice = () => {},
  currentUser,
  activeProjectId = 1,
  onOpenInCanvas,
  initialPrompt = '',
  onSendToChat,
}: VideoStudioProductionWorkspaceProps) {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [visualStyle, setVisualStyle] = useState<'pixar_3d' | 'cinematic' | 'anime' | 'cyberpunk'>('pixar_3d');
  const [languageMode, setLanguageMode] = useState<'bilingual' | 'urdu' | 'english' | 'roman_urdu'>('bilingual');
  const [customPrompt, setCustomPrompt] = useState(
    initialPrompt || 'Disney Pixar 3D animated fable: The mighty lion Sher is trapped in a hunter net in the forest, and tiny Cheenti the ant rescues him with quick wit and sharp teeth.',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<'sher_cheenti' | 'pak_village' | 'fox_rooster'>('sher_cheenti');

  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'canvas' | 'video'>('canvas');
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState(true);
  const [rightTab, setRightTab] = useState<'timeline' | 'characters' | 'export'>('timeline');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'player' | 'controls'>('player');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      void playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      void document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Preset Production Stories
  const presets = {
    sher_cheenti: {
      id: 'sher_cheenti' as const,
      title: 'Sher & Cheenti · 3D Pixar Animation',
      logline: 'An epic tale of unlikely friendship in an ancient jungle canopy.',
      masterAudio: '/api/audio-library/file/clip-master-1791104540695-hyjb',
      directVideoUrl: '/api/video/stream?operationName=veo-sher-cheenti-render',
      characters: [
        {
          id: 'sher',
          name: 'Sher (The Lion King)',
          role: 'King of the Jungle',
          avatarEmoji: '🦁',
          visualDescription: 'Majestic golden lion with glowing amber eyes and regal Pixar styling',
          voiceName: 'Fenrir' as const,
          pitch: 0.82,
          accentColor: '#F59E0B',
        },
        {
          id: 'cheenti',
          name: 'Cheenti (The Ant)',
          role: 'Clever Forest Hero',
          avatarEmoji: '🐜',
          visualDescription: 'Tiny determined ruby ant with expressive eyes and swift nimble jaws',
          voiceName: 'Puck' as const,
          pitch: 1.25,
          accentColor: '#10B981',
        },
      ],
      scenes: [
        {
          headline: 'The Grand Forest Clearing',
          subtext: 'The mighty lion Sher rests on the golden moss while tiny Cheenti scurries near.',
          bgGradient: ['#1e1b4b', '#3b0764'] as [string, string],
          accentColor: '#F59E0B',
          durationSec: 4.5,
          motionStyle: 'zoom' as const,
          imageUrl: pixarMagicalAdventureImg,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Cinematic Slow Zoom-In (24mm Pan)',
          speakerName: 'Sher',
          speakerVoice: 'Fenrir' as const,
          dialogueLine: 'Who dares disturb the sleep of the mighty King of the Jungle?',
          dialogueUrdu: 'جنگل کے بادشاہ کی نیند میں خلل ڈالنے کی جرأت کس نے کی؟',
          dialogueRomanUrdu: 'Jungle ke badshah ki neend mein khalal kis ne dala?',
          audioUrl: '/api/audio-library/file/clip-scene-1791104526690-0-acll',
          mouthRegion: { x: 360, y: 560, radius: 24 },
        },
        {
          headline: 'The Small Ant’s Vow',
          subtext: 'Cheenti speaks with courage, asking for mercy and promising future aid.',
          bgGradient: ['#0f172a', '#1e293b'] as [string, string],
          accentColor: '#10B981',
          durationSec: 4.2,
          motionStyle: 'pan' as const,
          imageUrl: pixarFoxForestImg,
          cameraShotType: 'close_up_b' as const,
          cameraMove: 'Macro Low-Angle Track',
          speakerName: 'Cheenti',
          speakerVoice: 'Puck' as const,
          dialogueLine: 'Do not harm me, mighty King! Small though I am, one day I may help you.',
          dialogueUrdu: 'مجھے معاف کیجیے بادشاہ سلامت! میں چھوٹی سہی، پر ایک دن آپ کے کام آؤں گی۔',
          dialogueRomanUrdu: 'Mujhe maaf kijiye! Main choti sahi, par ek din aapke kaam aaongi.',
          audioUrl: '/api/audio-library/file/clip-scene-1791104530522-1-5ok4',
          mouthRegion: { x: 380, y: 620, radius: 18 },
        },
        {
          headline: 'The Hunter’s Iron Net',
          subtext: 'A giant woven hunter’s net traps Sher beneath the shadow of tall oaks.',
          bgGradient: ['#450a0a', '#18181b'] as [string, string],
          accentColor: '#EF4444',
          durationSec: 5.0,
          motionStyle: 'kinetic' as const,
          imageUrl: sherScene3NetTrapImg,
          cameraShotType: 'over_shoulder' as const,
          cameraMove: 'High-Impact Dutch Tilt Drop',
          speakerName: 'Sher',
          speakerVoice: 'Fenrir' as const,
          dialogueLine: 'Alas! I am trapped and helpless! Is there anyone in this forest to save me?',
          dialogueUrdu: 'افسوس! میں شکاری کے جال میں پھنس گیا! کیا کوئی میری مدد کو آئے گا؟',
          dialogueRomanUrdu: 'Afsos! Main jaal mein phans gaya! Kya koi madad ko aayega?',
          audioUrl: '/api/audio-library/file/clip-scene-1791104534927-2-l3y8',
          mouthRegion: { x: 370, y: 580, radius: 28 },
        },
        {
          headline: 'The Swift Rescue Operation',
          subtext: 'Cheenti arrives with steadfast resolve and cuts through the thick ropes.',
          bgGradient: ['#064e3b', '#022c22'] as [string, string],
          accentColor: '#10B981',
          durationSec: 4.8,
          motionStyle: 'zoom' as const,
          imageUrl: sherScene4CuttingNetImg,
          cameraShotType: 'macro_action' as const,
          cameraMove: 'Extreme Macro Action Tracking',
          speakerName: 'Cheenti',
          speakerVoice: 'Puck' as const,
          dialogueLine: 'Fear not, King! My sharp teeth will slice every knot of this cruel net.',
          dialogueUrdu: 'فکر نہ کیجیے! میرے تیز دانت اس ظالم جال کی ہر رسی کاٹ دیں گے۔',
          dialogueRomanUrdu: 'Fikr na kijiye! Mere taiz daant is jaal ki har rassi kaat dein ge.',
          audioUrl: '/api/audio-library/file/clip-scene-1791104539301-3-2098',
          mouthRegion: { x: 360, y: 640, radius: 20 },
        },
        {
          headline: 'A Friendship Crowned in Light',
          subtext: 'Free once more, Sher bows his crown to tiny Cheenti under the moonlight.',
          bgGradient: ['#1e1b4b', '#1e3a8a'] as [string, string],
          accentColor: '#38BDF8',
          durationSec: 4.5,
          motionStyle: 'pulse' as const,
          imageUrl: pixarMagicalAdventureImg,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Warm Crane Upward Reveal',
          speakerName: 'Sher',
          speakerVoice: 'Fenrir' as const,
          dialogueLine: 'Thank you, true friend! Today you showed that bravery knows no size.',
          dialogueUrdu: 'شکریہ میرے سچے دوست! آج تم نے ثابت کیا کہ بہادری کا تعلق قد سے نہیں ہوتا۔',
          dialogueRomanUrdu: 'Shukriya mere sache dost! Aaj tum ne saabit kiya ke bahaduri qad se nahi hoti.',
          audioUrl: '/api/audio-library/file/clip-scene-1791104540688-4-3z20',
          mouthRegion: { x: 350, y: 550, radius: 22 },
        },
      ],
    },
    pak_village: {
      id: 'pak_village' as const,
      title: 'Pakistani Village Harvest Journey',
      logline: 'Warm golden wheat fields, traditional canal pathways & village life.',
      masterAudio: '/api/audio-library/file/clip-master-1791106829850-rkmt',
      directVideoUrl: '',
      characters: [
        {
          id: 'chacha',
          name: 'Chacha Barkat (Village Elder)',
          role: 'Storyteller & Farmer',
          avatarEmoji: '👳‍♂️',
          visualDescription: 'Elderly Punjabi village elder with silver beard, turban and warm smile',
          voiceName: 'Charon' as const,
          pitch: 0.9,
          accentColor: '#D97706',
        },
        {
          id: 'bilal',
          name: 'Bilal (Young Boy)',
          role: 'Curious Village Youth',
          avatarEmoji: '👦',
          visualDescription: 'Energetic village youth in traditional kurta enjoying morning mist',
          voiceName: 'Zephyr' as const,
          pitch: 1.05,
          accentColor: '#0EA5E9',
        },
      ],
      scenes: [
        {
          headline: 'Sunrise Over Golden Fields',
          subtext: 'Morning sun illuminates vast mustard and wheat crops in rural Punjab.',
          bgGradient: ['#78350f', '#451a03'] as [string, string],
          accentColor: '#F59E0B',
          durationSec: 4.5,
          motionStyle: 'pan' as const,
          imageUrl: pakistanFieldsImg,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Scenic Golden-Hour Aerial Pan',
          speakerName: 'Chacha Barkat',
          speakerVoice: 'Charon' as const,
          dialogueLine: 'Look Bilal, our soil gives us life and sustenance every blessed harvest.',
          dialogueUrdu: 'دیکھو بلال، ہماری مٹی ہمیں ہر فصل کے ساتھ نئی زندگی عطا کرتی ہے۔',
          dialogueRomanUrdu: 'Dekho Bilal, hamari mitti hamein nayi zindagi deti hai.',
          mouthRegion: { x: 360, y: 520, radius: 20 },
        },
        {
          headline: 'The Village Clay Pathways',
          subtext: 'Walking along the tranquil brick and clay trails bordered by tall neem trees.',
          bgGradient: ['#1c1917', '#292524'] as [string, string],
          accentColor: '#10B981',
          durationSec: 4.2,
          motionStyle: 'zoom' as const,
          imageUrl: pakistanPathImg,
          cameraShotType: 'close_up_b' as const,
          cameraMove: 'Smooth Steadicam Tracking Path',
          speakerName: 'Bilal',
          speakerVoice: 'Zephyr' as const,
          dialogueLine: 'Chacha ji, the village air in the morning is sweeter than anywhere on earth.',
          dialogueUrdu: 'چاچا جی، صبح کے وقت گاؤں کی ٹھنڈی ہوا جیسی تازگی دنیا میں کہیں نہیں۔',
          dialogueRomanUrdu: 'Chacha ji, subah ke waqt gaon ki hawa jaisi taazgi kahin nahi.',
          mouthRegion: { x: 380, y: 540, radius: 18 },
        },
        {
          headline: 'Traditional Courtyard Life',
          subtext: 'Laughter, hot clay tandoor rotis, and neighbors gathering for tea.',
          bgGradient: ['#7c2d12', '#431407'] as [string, string],
          accentColor: '#F97316',
          durationSec: 4.8,
          motionStyle: 'pulse' as const,
          imageUrl: pakVillageLifeImg,
          cameraShotType: 'over_shoulder' as const,
          cameraMove: 'Intimate Handheld Arc',
          speakerName: 'Chacha Barkat',
          speakerVoice: 'Charon' as const,
          dialogueLine: 'Come share the bread and lassi, for togetherness is the true wealth.',
          dialogueUrdu: 'آؤ تازہ روٹی اور لسی چکھو، باہمی پیار ہی ہماری اصل دولت ہے۔',
          dialogueRomanUrdu: 'Aao taaza roti aur lassi chakho, pyari hi asal daulat hai.',
          mouthRegion: { x: 370, y: 560, radius: 22 },
        },
        {
          headline: 'Village Canal Reflections',
          subtext: 'The evening water mirrors ancient banyan roots and drifting clouds.',
          bgGradient: ['#0f172a', '#1e3a8a'] as [string, string],
          accentColor: '#38BDF8',
          durationSec: 4.5,
          motionStyle: 'zoom' as const,
          imageUrl: pakistanVillage1Img,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Low Water-Level Glide',
          speakerName: 'Bilal',
          speakerVoice: 'Zephyr' as const,
          dialogueLine: 'I will cherish these canals and starry nights forever in my heart.',
          dialogueUrdu: 'میں ان نہروں اور ستاروں بھری راتوں کو ہمیشہ اپنے دل میں سنبھال کے رکھوں گا۔',
          dialogueRomanUrdu: 'Main in nehron aur taaron bhari raaton ko dil mein rakhunga.',
          mouthRegion: { x: 350, y: 530, radius: 19 },
        },
        {
          headline: 'The Heritage Legacy',
          subtext: 'Generations bonded in warmth and agricultural harmony.',
          bgGradient: ['#14532d', '#052e16'] as [string, string],
          accentColor: '#22C55E',
          durationSec: 4.2,
          motionStyle: 'pan' as const,
          imageUrl: pakistaniVillageImg,
          cameraShotType: 'close_up_a' as const,
          cameraMove: 'Sunset Crane Pull-Back',
          speakerName: 'Chacha Barkat',
          speakerVoice: 'Charon' as const,
          dialogueLine: 'Peace be upon our home, our fields, and all who cherish them.',
          dialogueUrdu: 'ہمارے وطن، کھیتوں اور ان سے محبت کرنے والوں پر ہمیشہ سلامتی ہو۔',
          dialogueRomanUrdu: 'Hamare watan aur kheton par hamesha salamati ho.',
          mouthRegion: { x: 360, y: 550, radius: 20 },
        },
      ],
    },
    fox_rooster: {
      id: 'fox_rooster' as const,
      title: 'Fox & Rooster Woodland Chase',
      logline: 'A clever comedic duel of wits in the enchanted deep woods.',
      masterAudio: '/api/audio-library/file/clip-master-1791107195351-fiy4',
      directVideoUrl: '',
      characters: [
        {
          id: 'rusty',
          name: 'Rusty Fox',
          role: 'Cunning Forest Schemer',
          avatarEmoji: '🦊',
          visualDescription: 'Vibrant red-orange fox with fluffy tail and theatrical trickster grin',
          voiceName: 'Kore' as const,
          pitch: 1.15,
          accentColor: '#F97316',
        },
        {
          id: 'barnaby',
          name: 'Barnaby Rooster',
          role: 'Proud Farm Champion',
          avatarEmoji: '🐓',
          visualDescription: 'Gallant rooster with flamboyant plumage and lightning quick reflexes',
          voiceName: 'Puck' as const,
          pitch: 1.22,
          accentColor: '#EAB308',
        },
      ],
      scenes: [
        {
          headline: 'The Treetop Invitation',
          subtext: 'Rusty approaches the tall pine branch where Barnaby roosts safely.',
          bgGradient: ['#14532d', '#052e16'] as [string, string],
          accentColor: '#22C55E',
          durationSec: 4.0,
          motionStyle: 'zoom' as const,
          imageUrl: pixarFoxForestImg,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Low Angle Looking Up At Perch',
          speakerName: 'Rusty Fox',
          speakerVoice: 'Kore' as const,
          dialogueLine: 'Dear cousin rooster, come down! All animals have declared eternal peace today!',
          dialogueUrdu: 'میرے پیارے بھائی مرغ، نیچے آؤ! آج سب جانوروں میں دائمی دوستی ہو گئی ہے!',
          dialogueRomanUrdu: 'Mere pyare bhai murgh, neechay aao! Aaj sab mein dosti ho gayi hai!',
          mouthRegion: { x: 350, y: 580, radius: 22 },
        },
        {
          headline: 'Barnaby’s Clever Glance',
          subtext: 'Barnaby squints toward the horizon with mock surprise.',
          bgGradient: ['#713f12', '#451a03'] as [string, string],
          accentColor: '#EAB308',
          durationSec: 4.2,
          motionStyle: 'pan' as const,
          imageUrl: pixarFoxChaseImg,
          cameraShotType: 'close_up_b' as const,
          cameraMove: 'Fast Zoom into Cocked Eyebrow',
          speakerName: 'Barnaby Rooster',
          speakerVoice: 'Puck' as const,
          dialogueLine: 'Wonderful news! And look—a pack of royal hunting dogs is rushing here to celebrate!',
          dialogueUrdu: 'سبحان اللہ! اور دیکھو—شکاری کتے بھی دوڑتے ہوئے جشن منانے آ رہے ہیں!',
          dialogueRomanUrdu: 'SubhanAllah! Aur dekho—shikari kuttay bhi yahan aa rahe hain!',
          mouthRegion: { x: 380, y: 530, radius: 18 },
        },
        {
          headline: 'The Panic Sprint',
          subtext: 'Rusty’s ears perk up in terror as he turns on his heels.',
          bgGradient: ['#7c2d12', '#1c1917'] as [string, string],
          accentColor: '#F97316',
          durationSec: 4.5,
          motionStyle: 'kinetic' as const,
          imageUrl: pixarVeggieVillageImg,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Hyper-Dynamic Tracking Sprint',
          speakerName: 'Rusty Fox',
          speakerVoice: 'Kore' as const,
          dialogueLine: 'Dogs?! Oh, pardon me—perhaps they haven’t heard the peace news yet!',
          dialogueUrdu: 'کتے؟! معاف کرنا بھائی، شاید انہوں نے ابھی امن کی خبر نہیں سنی!',
          dialogueRomanUrdu: 'Kuttay?! Maaf karna bhai, shayad unhon ne khabar nahi suni!',
          mouthRegion: { x: 360, y: 570, radius: 24 },
        },
        {
          headline: 'The Safe High Crow',
          subtext: 'Barnaby crows triumphantly atop the oak bough.',
          bgGradient: ['#1e1b4b', '#3b0764'] as [string, string],
          accentColor: '#A855F7',
          durationSec: 4.2,
          motionStyle: 'zoom' as const,
          imageUrl: pixarFoxForestImg,
          cameraShotType: 'close_up_a' as const,
          cameraMove: 'Victorious Ascending Orbit',
          speakerName: 'Barnaby Rooster',
          speakerVoice: 'Puck' as const,
          dialogueLine: 'Cock-a-doodle-doo! Wisdom always flies higher than cunning deceit!',
          dialogueUrdu: 'کوکڑوکوں! دانائی ہمیشہ فریب سے اونچی اڑان بھرتی ہے!',
          dialogueRomanUrdu: 'Kukdoon koon! Danai hamesha fareb se oonchi hoti hai!',
          mouthRegion: { x: 370, y: 540, radius: 20 },
        },
        {
          headline: 'Forest Harmony Restored',
          subtext: 'Sunlight filters through the moss as the wood returns to calm.',
          bgGradient: ['#042f2e', '#022c22'] as [string, string],
          accentColor: '#14B8A6',
          durationSec: 4.0,
          motionStyle: 'pulse' as const,
          imageUrl: pixarMagicalAdventureImg,
          cameraShotType: 'wide_action' as const,
          cameraMove: 'Wide Serene Dissolve',
          speakerName: 'Barnaby Rooster',
          speakerVoice: 'Puck' as const,
          dialogueLine: 'Another peaceful day in the sanctuary of the woods.',
          dialogueUrdu: 'جنگل کی اس پرامن پناہ گاہ میں ایک اور خوبصورت دن۔',
          dialogueRomanUrdu: 'Jungle mein ek aur khoobsoorat din.',
          mouthRegion: { x: 360, y: 550, radius: 20 },
        },
      ],
    },
  };

  const activePreset = presets[activePresetId];
  const activeScene: VideoStudioSceneItem = (activePreset.scenes[activeSceneIdx] || activePreset.scenes[0]) as VideoStudioSceneItem;
  const currentSceneCount = activePreset.scenes.length;

  // Preload Images
  const [loadedImages, setLoadedImages] = useState<{ [url: string]: HTMLImageElement }>({});
  useEffect(() => {
    activePreset.scenes.forEach((scene) => {
      if (scene.imageUrl && !loadedImages[scene.imageUrl]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = scene.imageUrl;
        img.onload = () => {
          setLoadedImages((prev) => ({ ...prev, [scene.imageUrl as string]: img }));
        };
      }
    });
  }, [activePreset, loadedImages]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const duration = activeScene.durationSec || 4.5;
      const progress = isPlaying ? (elapsed % duration) / duration : sceneProgress;
      setSceneProgress(progress);

      // If scene completed during active playback, move to next scene
      if (isPlaying && elapsed >= duration) {
        startTime = time;
        setActiveSceneIdx((prev) => (prev + 1) % currentSceneCount);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const targetImg = loadedImages[activeScene.imageUrl || ''];
      if (targetImg && targetImg.complete) {
        ctx.save();
        // Camera Motion Math
        let scale = 1.0;
        let offsetX = 0;
        let offsetY = 0;

        if (activeScene.motionStyle === 'zoom') {
          scale = 1.0 + progress * 0.12; // slow cinematic zoom
        } else if (activeScene.motionStyle === 'pan') {
          scale = 1.08;
          offsetX = (progress - 0.5) * 40; // horizontal pan
        } else if (activeScene.motionStyle === 'kinetic') {
          scale = 1.0 + Math.sin(progress * Math.PI) * 0.14;
        } else {
          scale = 1.0 + Math.sin(progress * 2) * 0.05;
        }

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx + offsetX, -cy + offsetY);

        // Draw image covering the canvas
        const imgRatio = targetImg.width / targetImg.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawW = canvas.width;
        let drawH = canvas.height;
        let drawX = 0;
        let drawY = 0;

        if (imgRatio > canvasRatio) {
          drawW = canvas.height * imgRatio;
          drawX = (canvas.width - drawW) / 2;
        } else {
          drawH = canvas.width / imgRatio;
          drawY = (canvas.height - drawH) / 2;
        }

        ctx.drawImage(targetImg, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else {
        // Fallback smooth gradient canvas
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, activeScene.bgGradient[0]);
        grad.addColorStop(1, activeScene.bgGradient[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 1. Audio-Reactive Lip-Sync Mouth Indicator
      if (isPlaying && activeScene.mouthRegion) {
        ctx.save();
        const pulse = Math.abs(Math.sin(time * 0.015)) * 0.8 + 0.2;
        const mx = (activeScene.mouthRegion.x / 720) * canvas.width;
        const my = (activeScene.mouthRegion.y / 1280) * canvas.height;
        const rad = (activeScene.mouthRegion.radius / 720) * canvas.width * (0.8 + pulse * 0.5);

        ctx.beginPath();
        ctx.ellipse(mx, my, rad * 1.3, rad * (0.4 + pulse * 0.6), 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 2. High-Contrast Bottom Gradient Scrim for Subtitles
      ctx.save();
      const scrimGrad = ctx.createLinearGradient(0, canvas.height - 240, 0, canvas.height);
      scrimGrad.addColorStop(0, 'rgba(6, 9, 19, 0)');
      scrimGrad.addColorStop(0.3, 'rgba(6, 9, 19, 0.6)');
      scrimGrad.addColorStop(1, 'rgba(6, 9, 19, 0.96)');
      ctx.fillStyle = scrimGrad;
      ctx.fillRect(0, canvas.height - 240, canvas.width, 240);

      // Top Header Gradient Scrim for Scene Label
      const topScrim = ctx.createLinearGradient(0, 0, 0, 110);
      topScrim.addColorStop(0, 'rgba(6, 9, 19, 0.85)');
      topScrim.addColorStop(1, 'rgba(6, 9, 19, 0)');
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, canvas.width, 110);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, activeScene, sceneProgress, loadedImages, currentSceneCount]);

  // Audio Playback Sync
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
      videoRef.current?.pause();
    } else {
      setIsPlaying(true);
      if (audioRef.current && !isMuted) {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => {});
      }
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleNextScene = () => {
    setActiveSceneIdx((prev) => (prev + 1) % currentSceneCount);
    setSceneProgress(0);
  };

  const handlePrevScene = () => {
    setActiveSceneIdx((prev) => (prev - 1 + currentSceneCount) % currentSceneCount);
    setSceneProgress(0);
  };

  // Generate New Video Pipeline Simulation
  const handleGenerateVideo = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    setGenStage('1/5. Engineering Multi-Character Script & Logline...');
    onNotice('🎬 Initiated Google Veo 3.1 + Imagen 3 9:16 Video Pipeline');

    setTimeout(() => {
      setGenStage('2/5. Casting Multi-Character Voices (Fenrir & Puck)...');
    }, 1200);

    setTimeout(() => {
      setGenStage('3/5. Generating 5-Scene Keyframes with Imagen 3 HD...');
    }, 2400);

    setTimeout(() => {
      setGenStage('4/5. Synthesizing Dialogue & Lip-Sync Envelopes...');
    }, 3800);

    setTimeout(() => {
      setGenStage('5/5. Assembling Vertical 9:16 MP4 Master Stream...');
    }, 5200);

    setTimeout(() => {
      setIsGenerating(false);
      setGenStage('');
      setActivePresetId('sher_cheenti');
      setActiveSceneIdx(0);
      setIsPlaying(true);
      onNotice('✨ Video Production Complete! 5 Scenes Assembled with Lip-Sync Dialogue.');
    }, 6600);
  };

  const handleDownloadMp4 = () => {
    onNotice('⬇ Exporting Merged 9:16 HD MP4 Video with Master Voiceover...');
    const link = document.createElement('a');
    link.href = activePreset.directVideoUrl || activePreset.masterAudio;
    link.download = `${activePreset.title.replace(/\s+/g, '_')}_9x16.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInCanvasPreview = () => {
    if (onOpenInCanvas) {
      const artifactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden border-2 border-amber-400 shadow-2xl relative bg-slate-900">
    <img src="${activeScene.imageUrl || ''}" class="w-full h-full object-cover" alt="Scene Preview" />
    <div class="absolute bottom-4 left-4 right-4 p-3 bg-black/80 rounded-2xl backdrop-blur">
      <div class="text-xs font-bold text-amber-400">${activeScene.speakerName}</div>
      <div class="text-sm font-semibold">${activeScene.dialogueLine}</div>
      <div class="text-xs text-slate-400 font-serif mt-1">${activeScene.dialogueUrdu || ''}</div>
    </div>
  </div>
</body>
</html>`;
      onOpenInCanvas(activePreset.title, artifactHtml);
      onNotice(`Opened "${activePreset.title}" in Live Canvas`);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#090D16] text-white">
      {/* Hidden Synchronized Audio Track */}
      <audio
        ref={audioRef}
        src={activeScene.audioUrl || activePreset.masterAudio}
        muted={isMuted}
        onEnded={handleNextScene}
      />

      {/* 1. Compact High-Density Studio Header (Zero Wasted Space) */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0B0F19] px-2.5 sm:px-4">
        {/* Left: Flagship Branding & Preset Story Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xs font-black text-xs">
              🎬
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap">
              AI Video Studio
            </span>
            <span className="hidden md:inline text-[10px] text-amber-400 font-mono">
              · Veo 3.1
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 ml-1 sm:ml-2 border-l border-slate-800 pl-1.5 sm:pl-2">
            {[
              { id: 'sher_cheenti', label: '🦁 Sher & Cheenti' },
              { id: 'pak_village', label: '🌾 Pakistani Village' },
              { id: 'fox_rooster', label: '🦊 Fox & Rooster' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePresetId(p.id as any);
                  setActiveSceneIdx(0);
                  setIsPlaying(false);
                  onNotice(`Loaded "${p.label}" Production Pipeline`);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition whitespace-nowrap ${
                  activePresetId === p.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Mobile Tab, Aspect Ratio, Mode & Quick Render Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5">
            <button
              type="button"
              onClick={() => setMobileTab('player')}
              className={`rounded px-2 py-0.5 text-[10.5px] font-bold transition whitespace-nowrap ${
                mobileTab === 'player'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎬 Canvas
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('controls')}
              className={`rounded px-2 py-0.5 text-[10.5px] font-bold transition whitespace-nowrap ${
                mobileTab === 'controls'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 Story
            </button>
          </div>

          {/* Canvas Mode Switcher: Interactive LipSync vs Video Stream */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'canvas' ? 'video' : 'canvas')}
            title={viewMode === 'canvas' ? 'Switch to Native Video Stream Player' : 'Switch to Interactive 3D Canvas'}
            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:border-amber-400 hover:text-white transition whitespace-nowrap"
          >
            <span>{viewMode === 'canvas' ? '🎨 3D Canvas' : '📹 Video Stream'}</span>
          </button>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`rounded px-2 py-0.5 text-[10.5px] font-bold transition whitespace-nowrap ${
                aspectRatio === '9:16'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vertical 9:16 (TikTok, Shorts, Reels)"
            >
              9:16
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`rounded px-2 py-0.5 text-[10.5px] font-bold transition whitespace-nowrap ${
                aspectRatio === '16:9'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Widescreen 16:9 (Cinematic YouTube)"
            >
              16:9
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadMp4}
            className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-amber-400 hover:text-white transition whitespace-nowrap"
          >
            <Download size={12} className="text-amber-400" />
            <span>MP4</span>
          </button>

          {onOpenInCanvas && (
            <button
              type="button"
              onClick={handleOpenInCanvasPreview}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition shadow-xs whitespace-nowrap"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Canvas</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main High-Density Workspace (Zero Margins, Full-Screen Presence) */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Column: Full-Screen Motion Video Player Canvas */}
        <section
          className={`relative flex flex-1 min-h-0 flex-col items-center justify-between overflow-hidden bg-slate-950 p-1.5 sm:p-2.5 ${
            mobileTab === 'controls' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Top Scene Pill Over Canvas */}
          <div className="absolute top-2.5 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 backdrop-blur-md">
                <span>{aspectRatio}</span>
                <span>·</span>
                <span>{activeScene.cameraShotType?.replace(/_/g, ' ').toUpperCase() || 'WIDE'}</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                Scene {activeSceneIdx + 1}/{currentSceneCount}
              </span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsSubtitlesEnabled((s) => !s)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold border transition ${
                  isSubtitlesEnabled
                    ? 'border-amber-400/50 bg-amber-400/20 text-amber-300'
                    : 'border-slate-800 bg-slate-950/80 text-slate-400'
                }`}
              >
                CC {isSubtitlesEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Interactive Scaled Canvas Frame Container */}
          <div className="relative flex flex-1 min-h-0 w-full items-center justify-center overflow-hidden">
            <div
              ref={playerContainerRef}
              className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800/90 bg-black shadow-2xl transition-all duration-200 ${
                aspectRatio === '9:16'
                  ? 'h-full max-h-full aspect-[9/16] w-auto'
                  : 'w-full max-w-full aspect-[16/9] h-auto max-h-full'
              }`}
            >
              {viewMode === 'canvas' ? (
                <canvas
                  ref={canvasRef}
                  width={aspectRatio === '9:16' ? 720 : 1280}
                  height={aspectRatio === '9:16' ? 1280 : 720}
                  className="h-full w-full object-contain cursor-pointer"
                  onClick={togglePlay}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={activePreset.directVideoUrl || activePreset.masterAudio}
                  controls
                  playsInline
                  loop
                  className="h-full w-full object-contain"
                />
              )}

              {/* Over-Canvas Subtitles & Speaker Tag */}
              {isSubtitlesEnabled && (
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none text-center">
                  <div className="inline-block max-w-[92%] rounded-xl bg-slate-950/85 px-3 py-1.5 border border-slate-800/90 backdrop-blur-md shadow-lg">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {activeScene.speakerName} ({activeScene.speakerVoice})
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white mt-0.5 leading-snug">
                      {activeScene.dialogueLine}
                    </div>
                    {activeScene.dialogueUrdu && (
                      <div className="text-xs sm:text-sm text-amber-200/90 font-serif-display mt-0.5 leading-relaxed" dir="rtl">
                        {activeScene.dialogueUrdu}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Center Big Play Button Overlay when Paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 z-10 grid place-items-center bg-black/35 hover:bg-black/25 transition cursor-pointer"
                  title="Click to Play Video"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-2xl transition hover:scale-105">
                    <Play size={24} className="ml-1 fill-current" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Player Controller Bar (Compact, Modern, Zero Layout Shifts) */}
          <div className="mt-1.5 flex w-full max-w-2xl items-center justify-between gap-1.5 sm:gap-2 rounded-xl border border-slate-800/90 bg-[#0B0F19]/95 px-2.5 sm:px-3 py-1.5 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevScene}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Previous Scene"
              >
                <SkipBack size={14} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="flex size-7 items-center justify-center rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={handleNextScene}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Next Scene"
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* Scrubber Bar */}
            <div className="flex flex-1 items-center gap-2 px-1 sm:px-2">
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                {`00:0${Math.floor(sceneProgress * (activeScene.durationSec || 4))}`}
              </span>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setSceneProgress(pct);
                }}
                className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-slate-800 overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-75"
                  style={{ width: `${sceneProgress * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                {`00:0${Math.floor(activeScene.durationSec || 4)}`}
              </span>
            </div>

            {/* Right Controls: Mute, Speed & Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  const speeds = [1, 1.25, 1.5];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIdx]);
                }}
                className="rounded px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Video'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: High-Density Prompt-to-Video Engine & 5-Scene Storyboard */}
        <aside
          className={`flex w-full flex-col border-t border-slate-800 bg-[#0B0F19] lg:w-[380px] lg:border-t-0 lg:border-l xl:w-[420px] shrink-0 overflow-hidden ${
            mobileTab === 'player' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Prompt-to-Video Generator Section */}
          <div className="border-b border-slate-800 p-3 sm:p-3.5 bg-slate-900/40">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Prompt-to-Video Generator
              </span>
              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-300">
                Veo 3.1 MP4
              </span>
            </div>

            {/* Quick Inspiration Presets */}
            <div className="mb-2 flex flex-wrap items-center gap-1">
              {[
                { label: '🌾 Rural Village', prompt: 'Cinematic 9:16 vertical view of a peaceful rural Pakistani village with mud-brick homes, golden mustard fields, and morning sun.' },
                { label: '🦁 Pixar Jungle', prompt: 'Disney Pixar 3D animated fable: The mighty lion Sher is trapped in a net and tiny Cheenti the ant cuts the ropes with quick wit.' },
                { label: '🦊 Fox & Rooster', prompt: '3D animated comedy story of a clever rooster outsmarting a hungry fox at sunrise on a picturesque countryside farm.' },
              ].map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => setCustomPrompt(qp.prompt)}
                  className="rounded-md border border-slate-800 bg-slate-950/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:border-amber-400/60 hover:text-amber-300 transition"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe storyline, visual style, 3D character world..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-hidden"
            />

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value as any)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] font-semibold text-slate-300 focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="pixar_3d">Disney Pixar 3D</option>
                  <option value="cinematic">Cinematic 8K</option>
                  <option value="anime">Studio Ghibli</option>
                  <option value="cyberpunk">Cyberpunk Neon</option>
                </select>

                <select
                  value={languageMode}
                  onChange={(e) => setLanguageMode(e.target.value as any)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] font-semibold text-slate-300 focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="bilingual">Urdu + English</option>
                  <option value="english">English Only</option>
                  <option value="urdu">Urdu Nastaliq</option>
                  <option value="roman_urdu">Roman Urdu</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateVideo}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:opacity-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={13} />
                    <span>Generate Video</span>
                  </>
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="mt-2 rounded-lg bg-amber-400/10 border border-amber-400/30 p-2 text-[11px] text-amber-300 animate-pulse">
                {genStage}
              </div>
            )}
          </div>

          {/* Tab Navigation for Storyboard, Cast, and Export */}
          <div className="flex border-b border-slate-800 bg-[#090D16]">
            {[
              { id: 'timeline', label: `Storyboard (${currentSceneCount})` },
              { id: 'characters', label: `Cast (${activePreset.characters.length})` },
              { id: 'export', label: 'Export & Share' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRightTab(tab.id as any)}
                className={`flex-1 py-2 text-center text-xs font-bold transition border-b-2 ${
                  rightTab === tab.id
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: 5-Scene Storyboard List */}
          {rightTab === 'timeline' && (
            <div className="flex-1 space-y-2 overflow-y-auto p-2.5 sm:p-3">
              {activePreset.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveSceneIdx(idx);
                    setSceneProgress(0);
                    if (!isPlaying) setIsPlaying(true);
                  }}
                  className={`flex gap-2 rounded-xl border p-2 text-left cursor-pointer transition ${
                    activeSceneIdx === idx
                      ? 'border-amber-400/80 bg-amber-400/10 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/80'
                  }`}
                >
                  {/* Scene Thumbnail */}
                  <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-black">
                    <img
                      src={scene.imageUrl}
                      alt={scene.headline}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 font-mono text-[9px] text-white">
                      0:0{Math.floor(scene.durationSec || 4)}
                    </span>
                  </div>

                  {/* Scene Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-white truncate">
                        {idx + 1}. {scene.headline}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9.5px] font-bold text-amber-400 shrink-0">
                        {scene.speakerName}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-300">
                      "{scene.dialogueLine}"
                    </p>

                    {scene.dialogueUrdu && (
                      <p className="line-clamp-1 text-[10.5px] text-amber-200/80 font-serif-display mt-0.5" dir="rtl">
                        {scene.dialogueUrdu}
                      </p>
                    )}

                    <div className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-slate-500 font-mono">
                      <span>{scene.cameraMove}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Cast & Voices */}
          {rightTab === 'characters' && (
            <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5 sm:p-3">
              {activePreset.characters.map((char) => (
                <div
                  key={char.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{char.avatarEmoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white">{char.name}</div>
                      <div className="text-[10.5px] text-slate-400">{char.role}</div>
                    </div>
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-400">
                      {char.voiceName} ({char.pitch}x)
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">
                    {char.visualDescription}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Production Specs & Export */}
          {rightTab === 'export' && (
            <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5 sm:p-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 space-y-1.5">
                <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                  Production Specifications
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-300">
                  <div>Resolution: <span className="font-mono text-white">1080×1920 (9:16)</span></div>
                  <div>Framerate: <span className="font-mono text-white">24 FPS</span></div>
                  <div>Scenes: <span className="font-mono text-white">{currentSceneCount} cuts</span></div>
                  <div>Audio: <span className="font-mono text-white">44.1kHz Stereo WAV</span></div>
                  <div>Engine: <span className="font-mono text-white">Google Veo 3.1</span></div>
                  <div>Lip-Sync: <span className="font-mono text-white">Reactive Canvas</span></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleDownloadMp4}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2 font-bold text-slate-950 hover:bg-amber-300 transition shadow-sm text-xs"
                >
                  <Download size={14} />
                  <span>Download Assembled HD MP4</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${activePreset.title}\n\n${activePreset.scenes
                        .map((s, i) => `Scene ${i + 1}: ${s.headline}\n${s.speakerName}: "${s.dialogueLine}"\nUrdu: ${s.dialogueUrdu || ''}`)
                        .join('\n\n')}`,
                    );
                    onNotice('📋 Story Script Copied to Clipboard!');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-1.5 font-bold text-slate-200 hover:bg-slate-800 transition text-xs"
                >
                  <Copy size={13} />
                  <span>Copy Complete Story Script</span>
                </button>

                {onSendToChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendToChat(customPrompt);
                      onNotice('Exported story prompt to Chat!');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-1.5 font-bold text-slate-200 hover:bg-slate-800 transition text-xs"
                  >
                    <Share2 size={13} />
                    <span>Send Story to Chat Assistant</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}


