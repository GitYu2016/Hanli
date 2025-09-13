/**
 * 文件类型工具组件
 * 提供文件类型检测、图标获取等工具方法
 */
class FileTypeUtils {
    constructor() {
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        // 定义支持的文件格式
        this.imageFormats = [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 
            'svg', 'ico', 'heic', 'heif', 'avif', 'jfif', 'pjpeg', 'pjp'
        ];
        
        this.videoFormats = [
            'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', 
            '3gp', '3g2', 'asf', 'rm', 'rmvb', 'vob', 'ogv', 'mts', 
            'm2ts', 'ts', 'divx', 'xvid', 'f4v', 'f4p', 'f4a', 'f4b'
        ];

        this.audioFormats = [
            'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'
        ];

        this.documentFormats = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'
        ];

        this.archiveFormats = [
            'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'
        ];

        // 文件类型图标映射
        this.fileTypeIcons = {
            image: 'IMG',
            video: 'VID',
            audio: 'AUD',
            json: 'JSON',
            pdf: 'PDF',
            document: 'DOC',
            archive: 'ZIP',
            default: 'FILE'
        };

        // 文件类型CSS类映射
        this.fileTypeClasses = {
            image: 'file-type-image',
            video: 'file-type-video',
            audio: 'file-type-audio',
            json: 'file-type-json',
            pdf: 'file-type-pdf',
            document: 'file-type-document',
            archive: 'file-type-archive',
            default: 'file-type-default'
        };
    }

    /**
     * 获取文件类型
     * @param {string} fileName - 文件名
     * @returns {string} 文件类型
     */
    getFileType(fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return 'default';
        }

        const ext = fileName.toLowerCase().split('.').pop();
        
        if (this.imageFormats.includes(ext)) return 'image';
        if (this.videoFormats.includes(ext)) return 'video';
        if (this.audioFormats.includes(ext)) return 'audio';
        if (ext === 'json') return 'json';
        if (ext === 'pdf') return 'pdf';
        if (this.documentFormats.includes(ext)) return 'document';
        if (this.archiveFormats.includes(ext)) return 'archive';
        
        return 'default';
    }

    /**
     * 获取文件图标类
     * @param {string} fileType - 文件类型
     * @returns {string} CSS类名
     */
    getFileIconClass(fileType) {
        return this.fileTypeClasses[fileType] || this.fileTypeClasses.default;
    }

    /**
     * 获取文件图标文本
     * @param {string} fileType - 文件类型
     * @returns {string} 图标文本
     */
    getFileIconText(fileType) {
        return this.fileTypeIcons[fileType] || this.fileTypeIcons.default;
    }

    /**
     * 检查是否为图片文件
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为图片文件
     */
    isImageFile(fileName) {
        return this.getFileType(fileName) === 'image';
    }

    /**
     * 检查是否为视频文件
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为视频文件
     */
    isVideoFile(fileName) {
        return this.getFileType(fileName) === 'video';
    }

    /**
     * 检查是否为音频文件
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为音频文件
     */
    isAudioFile(fileName) {
        return this.getFileType(fileName) === 'audio';
    }

    /**
     * 检查是否为文档文件
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为文档文件
     */
    isDocumentFile(fileName) {
        return this.getFileType(fileName) === 'document';
    }

    /**
     * 检查是否为媒体文件（图片、视频、音频）
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为媒体文件
     */
    isMediaFile(fileName) {
        const fileType = this.getFileType(fileName);
        return ['image', 'video', 'audio'].includes(fileType);
    }

    /**
     * 检查是否为可预览文件
     * @param {string} fileName - 文件名
     * @returns {boolean} 是否为可预览文件
     */
    isPreviewableFile(fileName) {
        const fileType = this.getFileType(fileName);
        return ['image', 'video', 'audio', 'pdf', 'json'].includes(fileType);
    }

    /**
     * 获取文件类型显示名称
     * @param {string} fileType - 文件类型
     * @returns {string} 显示名称
     */
    getFileTypeDisplayName(fileType) {
        const displayNames = {
            image: '图片文件',
            video: '视频文件',
            audio: '音频文件',
            json: 'JSON文件',
            pdf: 'PDF文件',
            document: '文档文件',
            archive: '压缩文件',
            default: '其他文件'
        };
        return displayNames[fileType] || displayNames.default;
    }

    /**
     * 获取文件扩展名
     * @param {string} fileName - 文件名
     * @returns {string} 扩展名（小写）
     */
    getFileExtension(fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return '';
        }
        return fileName.toLowerCase().split('.').pop();
    }

    /**
     * 获取文件MIME类型
     * @param {string} fileName - 文件名
     * @returns {string} MIME类型
     */
    getMimeType(fileName) {
        const ext = this.getFileExtension(fileName);
        
        const mimeTypes = {
            // 图片
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'tif': 'image/tiff',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon',
            'heic': 'image/heic',
            'heif': 'image/heif',
            'avif': 'image/avif',
            
            // 视频
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'wmv': 'video/x-ms-wmv',
            'flv': 'video/x-flv',
            'webm': 'video/webm',
            'mkv': 'video/x-matroska',
            'm4v': 'video/x-m4v',
            '3gp': 'video/3gpp',
            'ogv': 'video/ogg',
            
            // 音频
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'wma': 'audio/x-ms-wma',
            'm4a': 'audio/mp4',
            
            // 文档
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'rtf': 'application/rtf',
            'json': 'application/json',
            
            // 压缩文件
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip'
        };
        
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        if (i === 0) return bytes + ' ' + sizes[i];
        
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * 验证文件类型是否支持
     * @param {string} fileName - 文件名
     * @param {string[]} allowedTypes - 允许的文件类型数组
     * @returns {boolean} 是否支持
     */
    isFileTypeAllowed(fileName, allowedTypes) {
        const fileType = this.getFileType(fileName);
        return allowedTypes.includes(fileType);
    }

    /**
     * 获取所有支持的文件类型
     * @returns {string[]} 支持的文件类型数组
     */
    getSupportedFileTypes() {
        return Object.keys(this.fileTypeIcons);
    }

    /**
     * 获取指定类型的文件扩展名
     * @param {string} fileType - 文件类型
     * @returns {string[]} 扩展名数组
     */
    getExtensionsByType(fileType) {
        switch (fileType) {
            case 'image':
                return this.imageFormats;
            case 'video':
                return this.videoFormats;
            case 'audio':
                return this.audioFormats;
            case 'document':
                return this.documentFormats;
            case 'archive':
                return this.archiveFormats;
            default:
                return [];
        }
    }
}

// 创建全局实例
window.fileTypeUtils = new FileTypeUtils();

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileTypeUtils;
} else {
    window.FileTypeUtils = FileTypeUtils;
}
