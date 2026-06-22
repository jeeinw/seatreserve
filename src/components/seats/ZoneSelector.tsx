import clsx from 'clsx'
import { BUILDINGS, ZONES } from '@/data/offices'
import { useStore } from '@/store'

export function ZoneSelector() {
  const { selectedBuildingId, setSelectedBuildingId, selectedZoneId, setSelectedZoneId } =
    useStore()

  return (
    <div className="flex flex-col gap-4 w-56 flex-shrink-0">
      {BUILDINGS.map((building) => {
        const isActiveBuilding = selectedBuildingId === building.id
        return (
          <div key={building.id}>
            <button
              onClick={() => {
                setSelectedBuildingId(building.id)
                setSelectedZoneId(building.zones[0])
              }}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                isActiveBuilding
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              )}
            >
              {building.name}
            </button>

            {isActiveBuilding && (
              <div className="mt-1 ml-2 flex flex-col gap-0.5">
                {building.zones.map((zid) => {
                  const zone = ZONES[zid]
                  if (!zone) return null
                  return (
                    <button
                      key={zid}
                      onClick={() => setSelectedZoneId(zid)}
                      className={clsx(
                        'w-full text-left px-3 py-1.5 rounded text-xs transition-colors',
                        selectedZoneId === zid
                          ? 'bg-blue-100 text-blue-800 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100',
                      )}
                    >
                      <span>{zone.name.split(' ').slice(-1)[0]}</span>
                      <span className="ml-1 text-gray-400">({zone.capacity}석)</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
