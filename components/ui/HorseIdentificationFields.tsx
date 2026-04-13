"use client";

import {
  HORSE_BREEDS,
  HORSE_CATEGORIES,
  HORSE_COAT_COLORS,
  HORSE_GENDERS,
} from "@/lib/horse-options";
import { useLanguage } from "@/components/providers/LanguageProvider";

/** Shared shape for add / edit horse modals (identification block). */
export interface HorseIdentificationFormValues {
  name: string;
  registeredName: string;
  horseCategory: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  breed: string;
  color: string;
  markings: string;
  height: string;
  microchip: string;
  ueln: string;
  passportNumber: string;
  feiId: string;
  studbook: string;
  sireName: string;
  damName: string;
  countryOfBirth: string;
  owner: string;
}

interface HorseIdentificationFieldsProps {
  form: HorseIdentificationFormValues;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  formInput: string;
}

const DL_BREED = "horse-form-breed-dl";
const DL_COLOR = "horse-form-color-dl";

export default function HorseIdentificationFields({
  form,
  onChange,
  formInput,
}: HorseIdentificationFieldsProps) {
  const { t } = useLanguage();
  return (
    <>
      <p className="sm:col-span-2 text-xs uppercase tracking-widest text-black/50 mb-0 -mt-2">
        {t("dashboard.horseFormIdentification")}
      </p>
      <input
        name="name"
        placeholder={t("dashboard.horseFormBarnPlaceholder")}
        value={form.name}
        onChange={onChange}
        className={`sm:col-span-2 ${formInput}`}
        autoComplete="off"
      />
      <input
        name="registeredName"
        placeholder={t("dashboard.horseFormRegisteredPlaceholder")}
        value={form.registeredName}
        onChange={onChange}
        className={`sm:col-span-2 ${formInput}`}
        autoComplete="off"
      />
      <select
        name="horseCategory"
        value={form.horseCategory}
        onChange={onChange}
        className={formInput}
      >
        <option value="">{t("dashboard.horseFormHorseTypePlaceholder")}</option>
        {HORSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select name="gender" value={form.gender} onChange={onChange} className={formInput}>
        {HORSE_GENDERS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <input
        name="dateOfBirth"
        type="date"
        value={form.dateOfBirth}
        onChange={onChange}
        className={formInput}
      />
      <input
        name="age"
        type="number"
        min={0}
        placeholder={t("dashboard.horseFormAgePlaceholder")}
        value={form.age}
        onChange={onChange}
        className={formInput}
      />
      <input
        name="breed"
        placeholder={t("dashboard.horseFormBreedPlaceholder")}
        value={form.breed}
        onChange={onChange}
        list={DL_BREED}
        className={`sm:col-span-2 ${formInput}`}
        autoComplete="off"
      />
      <datalist id={DL_BREED}>
        {HORSE_BREEDS.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
      <input
        name="color"
        placeholder={t("dashboard.horseFormCoatPlaceholder")}
        value={form.color}
        onChange={onChange}
        list={DL_COLOR}
        className={formInput}
        autoComplete="off"
      />
      <datalist id={DL_COLOR}>
        {HORSE_COAT_COLORS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <textarea
        name="markings"
        placeholder={t("dashboard.horseFormMarkingsPlaceholder")}
        value={form.markings}
        onChange={onChange}
        rows={2}
        className={`sm:col-span-2 ${formInput} resize-y min-h-[4.5rem]`}
        autoComplete="off"
      />
      <input
        name="height"
        type="number"
        placeholder={t("dashboard.horseFormHeightPlaceholder")}
        value={form.height}
        onChange={onChange}
        className={formInput}
      />
      <input
        name="microchip"
        placeholder={t("dashboard.horseFormMicrochipPlaceholder")}
        value={form.microchip}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="ueln"
        placeholder={t("dashboard.horseFormUelnPlaceholder")}
        value={form.ueln}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="passportNumber"
        placeholder={t("dashboard.horseFormPassportPlaceholder")}
        value={form.passportNumber}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="feiId"
        placeholder={t("dashboard.horseFormFeiPlaceholder")}
        value={form.feiId}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="studbook"
        placeholder={t("dashboard.horseFormStudbookPlaceholder")}
        value={form.studbook}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="sireName"
        placeholder={t("dashboard.horseFormSirePlaceholder")}
        value={form.sireName}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="damName"
        placeholder={t("dashboard.horseFormDamPlaceholder")}
        value={form.damName}
        onChange={onChange}
        className={formInput}
        autoComplete="off"
      />
      <input
        name="countryOfBirth"
        placeholder={t("dashboard.horseFormCountryBirthPlaceholder")}
        value={form.countryOfBirth}
        onChange={onChange}
        className={`sm:col-span-2 ${formInput}`}
        autoComplete="off"
      />
      <p className="sm:col-span-2 text-xs uppercase tracking-widest text-black/50 mb-0">
        {t("dashboard.horseFormOwnerSection")}
      </p>
      <input
        name="owner"
        placeholder={t("dashboard.horseFormOwnerPlaceholder")}
        value={form.owner}
        onChange={onChange}
        className={`sm:col-span-2 ${formInput}`}
        autoComplete="off"
      />
    </>
  );
}
