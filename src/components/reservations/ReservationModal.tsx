import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format, differenceInDays, parseISO } from 'date-fns'
import { useStore } from '@/store'
import { ZONES, parseSeatUid } from '@/data/offices'
import { createReservation } from '@/api/client'
import type { ReservationRequest } from '@/types'

interface FormValues {
  projectName: string
  projectCode: string
  startDate: string
  endDate: string
  headcount: number
  reason: string
}

const MAX_MONTHS = 6
const WARN_MONTHS = 3

export function ReservationModal() {
  const { selectedSeatUids, selectedZoneId, closeReservationModal, clearSelectedSeats } =
    useStore()
  const qc = useQueryClient()

  const zone = ZONES[selectedZoneId]
  const seatCodes = selectedSeatUids.map((uid) => parseSeatUid(uid).code)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      headcount: seatCodes.length,
    },
  })

  const mutation = useMutation({
    mutationFn: (req: ReservationRequest) => createReservation(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seatStatus'] })
      qc.invalidateQueries({ queryKey: ['myReservations'] })
      clearSelectedSeats()
      closeReservationModal()
      alert('예약 신청이 접수되었습니다. 관리자 승인 후 확정됩니다.')
    },
    onError: () => {
      alert('예약 신청 중 오류가 발생했습니다.')
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const headcount = watch('headcount')

  const days = startDate && endDate ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1 : 0
  const months = days / 30
  const tooLong = months > MAX_MONTHS
  const warnLong = months > WARN_MONTHS
  const headcountRatio = headcount / seatCodes.length
  const headcountPadding = headcountRatio < 0.7 && seatCodes.length > 2

  const onSubmit = (data: FormValues) => {
    if (tooLong) return
    const req: ReservationRequest = {
      zoneId: selectedZoneId,
      seatUids: selectedSeatUids,
      seatCodes,
      projectName: data.projectName,
      projectCode: data.projectCode || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      headcount: Number(data.headcount),
      reason: data.reason,
    }
    mutation.mutate(req)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">좌석 예약 신청</h2>
          <button
            onClick={closeReservationModal}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
          {/* 선택 좌석 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-semibold mb-1">{zone?.name}</div>
            <div className="flex flex-wrap gap-1">
              {seatCodes.map((c) => (
                <span key={c} className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-mono">
                  {c}
                </span>
              ))}
            </div>
            <div className="text-xs text-blue-500 mt-1">총 {seatCodes.length}석</div>
          </div>

          {/* 경고 배너 */}
          {warnLong && !tooLong && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
              <b>장기 예약 안내:</b> {WARN_MONTHS}개월 초과 예약은 관리자 검토가 강화됩니다.
              사유를 구체적으로 작성해주세요.
            </div>
          )}
          {tooLong && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-700">
              <b>기간 초과:</b> 최대 {MAX_MONTHS}개월까지 신청 가능합니다. 기간을 조정해주세요.
            </div>
          )}
          {headcountPadding && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-sm text-orange-700">
              <b>인원 확인:</b> 선택 좌석({seatCodes.length}석) 대비 실인원({headcount}명)이
              70% 미만입니다. 실제 사용 인원을 정확히 입력해주세요.
            </div>
          )}

          {/* 프로젝트명 */}
          <div>
            <label className="label">프로젝트명 *</label>
            <input
              className="input"
              placeholder="예: 차세대 뱅킹앱 고도화"
              {...register('projectName', { required: '프로젝트명을 입력해주세요' })}
            />
            {errors.projectName && <p className="err">{errors.projectName.message}</p>}
          </div>

          {/* 프로젝트 코드 */}
          <div>
            <label className="label">프로젝트 코드 (선택)</label>
            <input className="input" placeholder="예: PRJ-2026-001" {...register('projectCode')} />
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">시작일 *</label>
              <input
                type="date"
                className="input"
                {...register('startDate', { required: '시작일을 선택해주세요' })}
              />
              {errors.startDate && <p className="err">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="label">종료일 *</label>
              <input
                type="date"
                className="input"
                min={startDate}
                {...register('endDate', { required: '종료일을 선택해주세요' })}
              />
              {errors.endDate && <p className="err">{errors.endDate.message}</p>}
            </div>
          </div>
          {days > 0 && (
            <p className="text-xs text-gray-500 -mt-2">
              총 {days}일 ({months.toFixed(1)}개월)
            </p>
          )}

          {/* 실 사용 인원 */}
          <div>
            <label className="label">실 사용 인원 *</label>
            <input
              type="number"
              min={1}
              max={seatCodes.length * 2}
              className="input"
              {...register('headcount', {
                required: '인원을 입력해주세요',
                min: { value: 1, message: '최소 1명 이상' },
              })}
            />
            <p className="text-xs text-gray-400 mt-0.5">
              실제 상주 예정 인원을 정확하게 입력해주세요 (어뷰징 방지)
            </p>
            {errors.headcount && <p className="err">{errors.headcount.message}</p>}
          </div>

          {/* 사용 사유 */}
          <div>
            <label className="label">사용 사유 *</label>
            <textarea
              rows={3}
              className="input resize-none"
              placeholder="예약이 필요한 이유를 구체적으로 작성해주세요. 장기·대량 예약일수록 승인 검토 시 중요합니다."
              {...register('reason', { required: '사용 사유를 입력해주세요' })}
            />
            {errors.reason && <p className="err">{errors.reason.message}</p>}
          </div>

          {/* 안내 */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <b>승인 안내:</b> 관리자 검토 후 승인/반려됩니다. 기간 종료 후 실제 사용 내역을
            업데이트하면 신뢰도 점수가 향상되어 향후 신청이 더 빠르게 처리됩니다.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeReservationModal}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || tooLong}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {isSubmitting ? '신청 중...' : '예약 신청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
