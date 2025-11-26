import clsx from 'clsx'
import { Folder, FolderArchive } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ZippedModImport } from './ZippedModImport'
import { ModFolderImport } from './ModFolderImport'

function ImportModsForm({
  importToLoadout,
  loadoutName,
}: {
  importToLoadout: boolean
  loadoutName: string | undefined
}) {
  const [zipActive, setZipActive] = useState(false)
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <>
      <div
        className={clsx(
          'flex justify-center gap-8 transition-all duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        <div
          className={clsx(
            'min-h-20 min-w-20 flex-col items-center justify-center rounded-md border bg-secondary p-4 transition hover:cursor-pointer hover:bg-secondary/80',
            zipActive && 'border-cyan-500',
            importToLoadout && 'hidden',
            !importToLoadout && 'flex',
          )}
          onClick={() => {
            setZipActive(() => true)
          }}
        >
          .zip <FolderArchive />
        </div>
        <div
          className={clsx(
            'flex min-h-20 min-w-20 flex-col items-center justify-center rounded-md border bg-secondary p-4 transition hover:cursor-pointer hover:bg-secondary/80',
            !zipActive && 'border-cyan-500',
          )}
          onClick={() => {
            setZipActive(() => false)
          }}
        >
          {t('mods.import.sheet.folder')} <Folder />
        </div>
      </div>
      {zipActive && !importToLoadout && (
        <ZippedModImport importToLoadout={importToLoadout} loadoutName={loadoutName} />
      )}
      {!zipActive && (
        <ModFolderImport importToLoadout={importToLoadout} loadoutName={loadoutName} />
      )}
    </>
  )
}

export default ImportModsForm
