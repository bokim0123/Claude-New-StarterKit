/**
 * ButtonAce 컴포넌트
 * - 전달받은 label을 표시하고, 클릭 시 onClick을 호출하는 기본 버튼
 */
interface ButtonAceProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ButtonAce = ({ label, onClick, disabled = false }: ButtonAceProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
};
