import { useMemo, useState } from "react";
import {
  ConfigProvider,
  Layout,
  Typography,
  InputNumber,
  Table,
  Tag,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Alert,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type GroupKey = "Потребности" | "Желания" | "Инвестиции";
type Category = { key: string; name: string; group: GroupKey; percent: number };

const initialCategories: Category[] = [
  { key: "rent", name: "Аренда", group: "Потребности", percent: 35 },
  { key: "groceries", name: "Продукты", group: "Потребности", percent: 15 },
  {
    key: "utilities",
    name: "Коммунальные услуги",
    group: "Потребности",
    percent: 5,
  },
  { key: "mobile", name: "Связь", group: "Потребности", percent: 3 },
  { key: "transport", name: "Транспорт", group: "Потребности", percent: 5 },
  { key: "hygiene", name: "Гигиена", group: "Потребности", percent: 3 },
  { key: "meds", name: "Лекарства", group: "Потребности", percent: 7 },
  { key: "shopping", name: "Шопинг", group: "Желания", percent: 7 },
  { key: "fun", name: "Развлечения", group: "Желания", percent: 5 },
  { key: "travel", name: "Путешествия", group: "Желания", percent: 5 },
  { key: "invest", name: "Инвестиции", group: "Инвестиции", percent: 5 },
  { key: "reserve", name: "Резервный фонд", group: "Инвестиции", percent: 5 },
];

const groupColors: Record<GroupKey, string> = {
  Потребности: "green",
  Желания: "blue",
  Инвестиции: "gold",
};

function currencyFormat(num: number, currency: string = "RUB") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function App() {
  const [budget, setBudget] = useState<number>(100_000);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const totals = useMemo(() => {
    const byGroup: Record<GroupKey, number> = {
      Потребности: 0,
      Желания: 0,
      Инвестиции: 0,
    };
    let all = 0;
    categories.forEach((c) => {
      byGroup[c.group] += c.percent;
      all += c.percent;
    });
    return { byGroup, all };
  }, [categories]);

  const dataWithMoney = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      amount: Math.round((budget * c.percent) / 100),
    }));
  }, [categories, budget]);

  const onPercentChange = (key: string, next: number | null) => {
    if (next == null) return;
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, percent: next } : c))
    );
  };

  const columns: ColumnsType<Category & { amount: number }> = [
    {
      title: "Категория",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <Space direction="vertical">
          <Text>{value}</Text>
          <Tag color={groupColors[record.group]}>{record.group}</Tag>
        </Space>
      ),
    },
    {
      title: "Процент",
      dataIndex: "percent",
      key: "percent",
      render: (_value, record) => (
        <InputNumber
          value={record.percent}
          min={0}
          max={100}
          onChange={(v) => onPercentChange(record.key, Number(v))}
        />
      ),
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: "180px",
      render: (value: number) => <Text strong>{currencyFormat(value)}</Text>,
    },
  ];

  const error = totals.all !== 100;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { borderRadius: 12, colorBgLayout: "#c0c0c0ff" },
      }}
    >
      <Layout>
        <Content
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Row
            gutter={[16, 16]}
            style={{
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <Col style={{ minWidth: 370 }}>
              <Card>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Title level={4} style={{ marginTop: 0 }}>
                    Введите бюджет
                  </Title>
                  <InputNumber
                    value={budget}
                    onChange={(v) => setBudget(Number(v ?? 0))}
                    min={0}
                    step={100}
                    precision={0}
                    onKeyDown={(e) => {
                      const ok = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Home",
                        "End",
                        "Tab",
                      ];
                      if (ok.includes(e.key)) return;
                      if (!/^\d$/.test(e.key)) e.preventDefault();
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    prefix={"₽"}
                    style={{ width: "100%" }}
                  />

                  <Divider style={{ margin: "8px 0" }} />
                  <Col style={{ paddingLeft: 0 }}>
                    <Row>
                      <Space direction="horizontal">
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          Потребности :
                        </Typography.Text>
                        <Text>
                          {currencyFormat(
                            dataWithMoney
                              .filter((d) => d.group === "Потребности")
                              .reduce((a, b) => a + b.amount, 0)
                          )}
                        </Text>
                      </Space>
                    </Row>
                    <Row>
                      <Space direction="horizontal">
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          Желания:
                        </Typography.Text>
                        <Text>
                          {currencyFormat(
                            dataWithMoney
                              .filter((d) => d.group === "Желания")
                              .reduce((a, b) => a + b.amount, 0)
                          )}
                        </Text>
                      </Space>
                    </Row>
                    <Row>
                      <Space direction="horizontal">
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          Инвестиции:
                        </Typography.Text>
                        <Text>
                          {currencyFormat(
                            dataWithMoney
                              .filter((d) => d.group === "Инвестиции")
                              .reduce((a, b) => a + b.amount, 0)
                          )}
                        </Text>
                      </Space>
                    </Row>
                  </Col>
                  <Space direction="vertical">
                    <Space>
                      <Text strong>Итого проценты:</Text>
                      <Tag color={error ? "red" : "success"}>
                        {totals.all.toFixed(2)}%
                      </Tag>
                      {error && <Text type="danger">Должно быть 100%</Text>}
                    </Space>
                    <Space>
                      <Text strong>Итого:</Text>
                      <Tag>{currencyFormat(budget)}</Tag>
                    </Space>
                  </Space>
                </Space>
              </Card>
            </Col>
            <Col style={{ minWidth: 370 }}>
              <Card>
                <Paragraph>
                  Проценты можно менять. Суммы пересчитываются автоматически из
                  введённого бюджета.
                </Paragraph>
                {error && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Сумма процентов не равна 100%"
                    description="Для корректного распределения скорректируйте значения."
                    style={{ marginBottom: 16 }}
                  />
                )}
                <Table
                  size="middle"
                  rowKey="key"
                  pagination={false}
                  columns={columns}
                  dataSource={dataWithMoney}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
