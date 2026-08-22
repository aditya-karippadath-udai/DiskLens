import { DuplicateGroup, FileItem } from '../types/file';

export type DuplicateSelectionStrategy =
  | 'keep_oldest'
  | 'keep_newest'
  | 'keep_home'
  | 'keep_shortest_path'
  | 'select_all_duplicates'
  | 'deselect_all';

export const duplicateService = {
  /**
   * Applies automated duplicate selection heuristics to safely mark files for deletion
   */
  applySelectionStrategy(
    groups: DuplicateGroup[],
    strategy: DuplicateSelectionStrategy
  ): DuplicateGroup[] {
    return groups.map((group) => {
      const files = [...group.files];
      let originalId = group.originalFileId;

      switch (strategy) {
        case 'keep_oldest': {
          // Find the one with earliest modifiedAt
          const sorted = [...files].sort(
            (a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()
          );
          originalId = sorted[0].id;
          break;
        }
        case 'keep_newest': {
          const sorted = [...files].sort(
            (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
          );
          originalId = sorted[0].id;
          break;
        }
        case 'keep_home': {
          const homeFile = files.find((f) => f.path.startsWith('/home')) || files[0];
          originalId = homeFile.id;
          break;
        }
        case 'keep_shortest_path': {
          const sorted = [...files].sort((a, b) => a.path.length - b.path.length);
          originalId = sorted[0].id;
          break;
        }
        case 'select_all_duplicates': {
          // Keep current original, select all other copies
          break;
        }
        case 'deselect_all': {
          return {
            ...group,
            files: files.map((f) => ({
              ...f,
              isSelected: false,
            })),
          };
        }
      }

      const updatedFiles = files.map((f) => ({
        ...f,
        isOriginal: f.id === originalId,
        isSelected: f.id !== originalId,
      }));

      return {
        ...group,
        originalFileId: originalId,
        files: updatedFiles,
      };
    });
  },

  /**
   * Toggles selection state for an individual file inside a group
   */
  toggleFileSelection(
    groups: DuplicateGroup[],
    groupId: string,
    fileId: string
  ): DuplicateGroup[] {
    return groups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        files: group.files.map((file) => {
          if (file.id !== fileId) return file;
          // If it's the original, don't allow selecting for deletion unless another original is set
          if (file.isOriginal) return file;
          return { ...file, isSelected: !file.isSelected };
        }),
      };
    });
  },

  /**
   * Sets a specific file as the designated KEEP original
   */
  setGroupOriginal(
    groups: DuplicateGroup[],
    groupId: string,
    newOriginalId: string
  ): DuplicateGroup[] {
    return groups.map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        originalFileId: newOriginalId,
        files: group.files.map((file) => ({
          ...file,
          isOriginal: file.id === newOriginalId,
          isSelected: file.id === newOriginalId ? false : file.isSelected,
        })),
      };
    });
  },

  /**
   * Removes deleted files from duplicate groups and recalculates recoverable space
   */
  purgeDeletedFiles(
    groups: DuplicateGroup[],
    deletedPaths: string[]
  ): DuplicateGroup[] {
    const pathSet = new Set(deletedPaths);
    return groups
      .map((group) => {
        const remainingFiles = group.files.filter((f) => !pathSet.has(f.path));
        if (remainingFiles.length <= 1) return null; // No longer a duplicate group
        
        let original = remainingFiles.find((f) => f.isOriginal) || remainingFiles[0];
        original = { ...original, isOriginal: true, isSelected: false };

        const fileSize = remainingFiles[0].size;
        const recoverableSize = (remainingFiles.length - 1) * fileSize;
        const totalSize = remainingFiles.length * fileSize;

        return {
          ...group,
          originalFileId: original.id,
          files: remainingFiles.map((f) => (f.id === original.id ? original : f)),
          totalSize,
          recoverableSize,
        };
      })
      .filter((g): g is DuplicateGroup => g !== null);
  },

  /**
   * Calculates total selected files and recoverable bytes across groups
   */
  getSelectedStats(groups: DuplicateGroup[]): { count: number; bytes: number; paths: string[] } {
    let count = 0;
    let bytes = 0;
    const paths: string[] = [];

    for (const group of groups) {
      for (const file of group.files) {
        if (file.isSelected && !file.isOriginal) {
          count++;
          bytes += file.size;
          paths.push(file.path);
        }
      }
    }

    return { count, bytes, paths };
  },
};
