const API_BASE_URL = "";

function App() {
  return {
    batchGpaData: [],
    loading: false,
    error: null,
    selectedBatchYear: "",
    selectedSemester: "",
    allYears: Array.from({ length: 1971 - 1952 + 1 }, (_, i) => 1952 + i),

    async selectYear(year) {
      this.selectedBatchYear = year;
      this.selectedSemester = "";
      this.batchGpaData = [];
      this.error = null;
    },

    async selectSemester(sem) {
      this.selectedSemester = sem;
      await this.fetchBatchGPA();
    },

    async fetchBatchGPA() {
      this.loading = true;
      this.error = null;
      this.batchGpaData = [];

      if (!this.selectedBatchYear || !this.selectedSemester) {
        this.error = "Please select both year and semester.";
        this.loading = false;
        return;
      }

      const url = `${API_BASE_URL}/batch-gpa?year=${this.selectedBatchYear}&semester=${this.selectedSemester}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        this.batchGpaData = data;
      } catch (err) {
        console.error("Error:", err);
        this.error = "Could not load batch GPA data.";
      } finally {
        this.loading = false;
      }
    },

    async loadAllData() {
      this.loading = true;
      this.error = null;
      this.batchGpaData = [];
      this.selectedBatchYear = "";
      this.selectedSemester = "";

      try {
        const response = await fetch(`${API_BASE_URL}/batch-gpa`);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        this.batchGpaData = data;
      } catch (err) {
        console.error("Error loading all data:", err);
        this.error = "Could not load all batch GPA data.";
      } finally {
        this.loading = false;
      }
    }
  };
}
